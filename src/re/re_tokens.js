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

export { getToken, getConcat, getBracketClass, getParenClose };
