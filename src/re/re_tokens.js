//------------------------------------------------------------------------------
// Parse the regex
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { warn } from './re_warnings.js';

//------------------------------------------------------------------------------
// Constants

const digits = new Set('0123456789');
const words = new Set(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
);
const spaces = new Set(' \\f\\n\\r\\t\\v');

//------------------------------------------------------------------------------
// Matching functions

const matchAll = (ch) => true;

const match = (label) => (ch) => ch === label;

const matchIn = (set) => (ch) => set.has(ch);

const matchNotIn = (set) => (ch) => !set.has(ch);

//------------------------------------------------------------------------------
// Create tokens

const value = (label, type, match) => (pos, index) => ({
  label,
  type,
  pos,
  index,
  match,
});

const operator = (label) => (pos, index) => ({
  label,
  type: label,
  pos,
  index,
});

//------------------------------------------------------------------------------
// Satic tokens

const tokens = {
  // Values
  '.': value('.', '.', matchAll),

  '\\d': value('\\d', 'charClass', matchIn(digits)),
  '\\D': value('\\D', 'charClass', matchNotIn(digits)),
  '\\w': value('\\w', 'charClass', matchIn(words)),
  '\\W': value('\\W', 'charClass', matchNotIn(words)),
  '\\s': value('\\s', 'charClass', matchIn(spaces)),
  '\\S': value('\\S', 'charClass', matchNotIn(spaces)),

  // Operators
  '|': operator('|'),
  '?': operator('?'),
  '*': operator('*'),
  '+': operator('+'),
  '(': operator('('),
  ')': operator(')'),
};

const staticTokens = {
  // Values
  '.': value('.', '.', () => true),

  '\\d': value('\\d', 'charClass', matchIn(digits)),
  '\\D': value('\\D', 'charClass', matchNotIn(digits)),
  '\\w': value('\\w', 'charClass', matchIn(words)),
  '\\W': value('\\W', 'charClass', matchNotIn(words)),
  '\\s': value('\\s', 'charClass', matchIn(spaces)),
  '\\S': value('\\S', 'charClass', matchNotIn(spaces)),

  // Operators
  '|': operator('|'),
  '?': operator('?'),
  '*': operator('*'),
  '+': operator('+'),
  '(': operator('('),
  ')': operator(')'),
};

//------------------------------------------------------------------------------
// Helper functions for lexemes

const addLexeme = (lexemes, label, type, pos) => {
  const lexeme = { label, type, pos, index: lexemes.length };
  lexemes.push(lexeme);
};

const describe = (lexeme, info) => {
  Object.entries(info).forEach(([key, value]) => (lexeme[key] = value));
};

//------------------------------------------------------------------------------
// Tokenize

const parse = (regex) => {
  let pos = 0;
  const lexemes = [];
  const tokens = [];
  const warnings = [];

  while (pos < regex.length) {
    const ch = regex[pos];
    const ch2 = regex[pos + 1];
    const label = regex.slice(pos, pos + 2);
    const index = lexemes.length;
    let token = null;
    let lexemesAdded = false;

    // Bracket expression
    if (ch === '[') {
      token = readBracketExpression(regex, pos, lexemes, warnings);
      lexemesAdded = true;
    }

    // Static tokens (operators and wildcard)
    else if (ch in staticTokens) {
      token = staticTokens[ch](pos, index);
    }

    // Character classes
    else if (label in staticTokens) {
      token = staticTokens[label](pos, index);
    }

    // Escaped chararacter
    else if (ch === '\\' && ch2 !== undefined) {
      token = value(label, 'escapedChar', match(ch2))(pos, index);
    }

    // Syntax error: terminal backslash
    else if (ch === '\\') {
      token = value(ch, 'escapedChar', matchAll)(pos, index);
      token.invalid = true;
      warn('\\E', pos, index, warnings);
    }

    // Character literal
    else {
      token = value(ch, 'charLiteral', match(ch))(pos, index);
    }

    // If lexemes have not already been added (bracket expressions)
    if (!lexemesAdded) addLexeme(lexemes, token.label, token.type, pos);
    tokens.push(token);
    pos += token.label.length;
  }

  return { lexemes, tokens, warnings };
};

//------------------------------------------------------------------------------
// Bracket expressions: Helpers

const eat = (type, state) => {
  const { regex, pos, lexemes } = state;
  addLexeme(lexemes, regex[pos], type, pos);
  state.pos++;
};

const tryEat = (label, type, state) => {
  if (state.regex[state.pos] === label) {
    eat(type, state);
    return true;
  }
  return false;
};

const read = (type, state, action) => {
  const { regex, pos, lexemes } = state;
  const label = regex[pos];
  addLexeme(lexemes, label, type, pos);
  action(label);
  state.pos++;
};

const tryRead = (label, type, state, action) => {
  if (state.regex[state.pos] === label) {
    read(type, state, action);
    return true;
  }
  return false;
};

const tryReadBracketRange = (state, action) => {
  const { regex, pos } = state;

  if (
    regex.length - pos < 3 ||
    regex[pos + 1] !== '-' ||
    regex[pos + 2] === ']'
  ) {
    return false;
  }

  const rangeLow = regex.charCodeAt(pos);
  const rangeHigh = regex.charCodeAt(pos + 2);
  for (let i = rangeLow; i <= rangeHigh; i++) {
    action(String.fromCharCode(i));
  }

  eat('bracketRangeLow', state);
  eat('-', state);
  eat('bracketRangeHigh', state);

  return true;
};

//------------------------------------------------------------------------------
// Bracket expressions: Main

const readBracketExpression = (regex, pos, lexemes, warnings) => {
  const set = new Set();
  const add = (label) => set.add(label);
  const state = { regex, pos, lexemes };
  const begin = lexemes.length;

  eat('[', state);
  const negate = tryEat('^', '^', state);

  // Special characters are treated as literals at the beginning
  tryRead(']', 'bracketChar', state, add) ||
    tryRead('-', 'bracketChar', state, add);

  // Try a character range, otherwise read a chararacter literal
  while (state.pos < regex.length && regex[state.pos] !== ']') {
    tryReadBracketRange(state, add) || read('bracketChar', state, add);
  }

  // Finalize lexemes
  const end = lexemes.length;
  const matches = [...set].join('');
  const info = { begin, end, negate, matches };
  describe(lexemes[begin], info);

  const label = regex.slice(pos, state.pos) + ']';

  // Syntax error: open bracket with no closing
  const hasClosingBracket = regex[state.pos] === ']';
  if (hasClosingBracket) {
    eat(']', state);
    describe(lexemes[end], info);
  } else {
    warn('[', state.pos, begin, warnings);
  }

  // Token
  return {
    label,
    type: 'bracketClass',
    pos,
    index: begin,
    match: negate ? matchNotIn(set) : matchIn(set),
  };
};

//------------------------------------------------------------------------------
// Get tokens

// Used in re_parser, to be refactored out

const getToken = (label, pos, index) => {
  const ch = label[0];

  const createToken =
    ch in tokens
      ? tokens[ch]
      : label in tokens
      ? tokens[label]
      : ch === '\\'
      ? value(label, 'escapedChar', match(label[1]))
      : value(ch, 'charLiteral', match(ch));

  return createToken(pos, index);
};

const getConcat = () => operator('~')(null, null);

const getParenClose = (pos, index) => operator(')')(pos, index);

const getBracketClass = (label, pos, index, info) => {
  const match = info.negate ? matchNotIn(info.matches) : matchIn(info.matches);
  return {
    ...value(label, 'bracketClass', match)(pos, index),
    ...info,
  };
};

//------------------------------------------------------------------------------

export { parse, getToken, getConcat, getBracketClass, getParenClose };

parse('\\+\\+[a-c]okl');
