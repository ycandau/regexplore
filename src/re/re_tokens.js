//------------------------------------------------------------------------------
// Tokens
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Constants

const DIGITS = '0123456789';
const WORDS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const SPACES = ' \\f\\n\\r\\t\\v';

//------------------------------------------------------------------------------
// Matching functions

const match = (label) => (ch) => ch === label;

const matchIn = (str) => {
  const set = new Set(str.split(''));
  return (ch) => set.has(ch);
};

const matchNotIn = (str) => {
  const set = new Set(str.split(''));
  return (ch) => !set.has(ch);
};

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

  '\\d': value('\\d', 'charClass', matchIn(DIGITS)),
  '\\D': value('\\D', 'charClass', matchNotIn(DIGITS)),
  '\\w': value('\\w', 'charClass', matchIn(DIGITS + WORDS)),
  '\\W': value('\\W', 'charClass', matchNotIn(DIGITS + WORDS)),
  '\\s': value('\\s', 'charClass', matchIn(SPACES)),
  '\\S': value('\\S', 'charClass', matchNotIn(SPACES)),

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

const tokenize = (regex) => {
  let pos = 0;
  let index = 0;
  const lexemes = [];
  const tokens = [];

  while (pos < regex.length) {
    const ch = regex[pos];
    const ch2 = regex[pos + 1];
    const label = regex.slice(pos, pos + 2);
    let token = null;
    let addLexeme = true;

    // Bracket expression
    if (ch === '[') {
      token = getBracketClass(regex, pos, index, lexemes);
      addLexeme = false;
    }

    // Static tokens (operators and wildcard)
    else if (ch in tokens) {
      token = tokens[ch](pos, index);
    }

    // Character classes
    else if (label in tokens) {
      token = tokens[label](pos, index);
    }

    // Escaped chararacter
    else if (ch === '\\' && ch2 !== undefined) {
      token = value(label, 'escapedChar', match(ch2))(pos, index);
    }

    // Character literal
    else {
      token = value(label, 'bracketClass', match(ch))(pos, index);
    }

    // If lexemes have not already been added (bracket expressions)
    if (addLexeme) {
      lexemes.push({ label: token.label, type: token.type, pos, index });
    }
    tokens.push(token);
    pos += token.label.length;
    index++;
  }

  return { lexemes, tokens };
};

//------------------------------------------------------------------------------

export { getToken, getConcat, getBracketClass, getParenClose };
