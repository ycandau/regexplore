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

const value = (label, type, match) => ({
  label,
  type,
  match,
});

const charClass = (label, match) => value(label, 'charClass', match);

const operator = (label, config) => ({
  label,
  type: label,
  ...config,
});

//------------------------------------------------------------------------------
// Satic tokens

const tokens = {
  // Values
  '.': value('.', '.', () => true),

  '\\d': charClass('\\d', matchIn(DIGITS)),
  '\\D': charClass('\\D', matchNotIn(DIGITS)),
  '\\w': charClass('\\w', matchIn(DIGITS + WORDS)),
  '\\W': charClass('\\W', matchNotIn(DIGITS + WORDS)),
  '\\s': charClass('\\s', matchIn(SPACES)),
  '\\S': charClass('\\S', matchNotIn(SPACES)),

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
  if (ch in tokens) {
    return { ...tokens[ch], pos, index };
  }

  if (label in tokens) {
    return { ...tokens[label], pos, index };
  }

  if (label[0] === '\\') {
    const token = value(label, 'escapedChar', match(label[1]));
    token.pos = pos;
    token.index = index;
    return token;
  }

  const token = value(ch, 'charLiteral', match(ch));
  token.pos = pos;
  token.index = index;
  return token;
};

const getEmpty = () => value('0', 'empty');

const getConcat = () => operator('~', 'concat');

const getBracketClass = (label, info) => {
  const match = info.negate ? matchNotIn(info.matches) : matchIn(info.matches);
  return {
    ...value(label, 'bracketClass', match),
    ...info,
  };
};

//------------------------------------------------------------------------------

export { getToken, getConcat, getBracketClass, getEmpty };
