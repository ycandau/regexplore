//------------------------------------------------------------------------------
// Tokens
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Constants

const digits = new Set('0123456789');
const words = new Set(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
);
const spaces = new Set(' \\f\\n\\r\\t\\v');

//------------------------------------------------------------------------------
// Matching functions

const match = (label) => (ch) => ch === label;

const matchIn = (set) => (ch) => set.has(ch);

const matchNotIn = (set) => (ch) => !set.has(ch);

//------------------------------------------------------------------------------
// Create token types

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

const addLexeme = (lexemes, label, type, pos) => {
  const lexeme = { label, type, pos, index: lexemes.length };
  lexemes.push(lexeme);
};

const describe = (lexeme, info) => {
  Object.entries(info).forEach(([key, value]) => (lexeme[key] = value));
};

//------------------------------------------------------------------------------
// Tokenize

const tokenize = (regex) => {
  let pos = 0;
  const lexemes = [];
  const tokens = [];

  while (pos < regex.length) {
    const ch = regex[pos];
    const ch2 = regex[pos + 1];
    const label = regex.slice(pos, pos + 2);
    const index = lexemes.length;
    let token = null;
    let lexemesAdded = false;

    // Bracket expression
    if (ch === '[') {
      token = readBracketExpression(regex, pos, lexemes);
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

    // Character literal
    else {
      token = value(ch, 'charLiteral', match(ch))(pos, index);
    }

    // If lexemes have not already been added (bracket expressions)
    if (!lexemesAdded) addLexeme(lexemes, token.label, token.type, pos);
    tokens.push(token);
    pos += token.label.length;
  }

  return { lexemes, tokens };
};

//------------------------------------------------------------------------------
// Bracket expressions

const eat = (type, state) => {
  const { regex, pos, lexemes } = state;
  addLexeme(lexemes, regex[pos], type, pos);
  state.pos++;
};

const tryEat = (type, state) => {
  if (state.regex[state.pos] === type) {
    eat(type, state);
    return true;
  }
  return false;
};

const readBracketChar = (state) => {
  const { regex, pos, lexemes, set } = state;
  const label = regex[pos];
  addLexeme(lexemes, label, 'bracketChar', pos);
  set.add(label);
  state.pos++;
};

const tryReadBracketChar = (label, state) => {
  if (state.regex[state.pos] === label) {
    readBracketChar(state);
    return true;
  }
  return false;
};

const tryReadBracketRange = (state) => {
  const { regex, pos, set } = state;

  if (
    regex.length - pos < 3 ||
    regex[pos + 1] !== '-' ||
    regex[pos + 2] === ']'
  ) {
    return false;
  }
  // const a = regex[pos];

  const rangeLow = regex.charCodeAt(pos);
  const rangeHigh = regex.charCodeAt(pos + 2);
  for (let i = rangeLow; i <= rangeHigh; i++) {
    set.add(String.fromCharCode(i));
  }

  eat('bracketRangeLow', state);
  eat('-', state);
  eat('bracketRangeHigh', state);

  return true;
};

const readBracketExpression = (regex, pos, lexemes) => {
  const set = new Set();
  const state = { regex, pos, lexemes, set };
  const begin = lexemes.length;

  eat('[', state);
  const negate = tryEat('^', state);

  // Special characters are treated as literals at the beginning
  tryReadBracketChar(']', state) || tryReadBracketChar('-', state);

  // Try char range, otherwise read char literal
  while (state.pos < regex.length && regex[state.pos] !== ']') {
    tryReadBracketRange(state) || readBracketChar(state);
  }

  // Finalize
  const end = lexemes.length;
  const matches = [...set].join('');
  const info = { begin, end, negate, matches };
  describe(lexemes[begin], info);

  // Syntax error: open bracket with no closing
  const hasClosingBracket = regex[state.pos] === ']';
  if (hasClosingBracket) {
    eat(']', state);
    describe(lexemes[end], info);
  } else {
    this.addWarning('![', state.pos, begin);
  }

  const label = regex.slice(begin, end + 1) + (hasClosingBracket ? '' : ']');
  const match = negate ? matchNotIn(set) : matchIn(set);
  return {
    label,
    type: 'bracketClass',
    pos,
    index: begin,
    match,
  };
};

//------------------------------------------------------------------------------

export { tokenize, getToken, getConcat, getBracketClass, getParenClose };

tokenize('[a-c]');
