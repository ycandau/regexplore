//------------------------------------------------------------------------------
// Constants

const DIGITS = '0123456789';
const WORDS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const SPACES = ' \\f\\n\\r\\t\\v';

//------------------------------------------------------------------------------
// Create matching functions from a string

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

const charClass = (label, name, match) => ({
  label,
  name,
  type: 'charclass',
  match,
  concatAfter: true,
});

const charLiteral = (label) => charClass(label, 'char', (ch) => label === ch);

const escapedLiteral = (label) =>
  charClass(label, 'escaped', (ch) => label[1] === ch);

const operator = (label, name, type, config) => ({
  label,
  name,
  type,
  ...config,
});

const concat = operator('~', 'concat');

//------------------------------------------------------------------------------
// Token type object

const types = {
  '.': charClass('.', 'wildcard', () => true),
  '\\d': charClass('\\d', 'digits', matchIn(DIGITS)),
  '\\D': charClass('\\D', 'non-digits', matchNotIn(DIGITS)),
  '\\w': charClass('\\w', 'alphanumeric', matchIn(DIGITS + WORDS)),
  '\\W': charClass('\\W', 'non-alphanumeric', matchNotIn(DIGITS + WORDS)),
  '\\s': charClass('\\s', 'whitespace', matchIn(SPACES)),
  '\\S': charClass('\\S', 'non-whitespace', matchNotIn(SPACES)),

  '|': operator('|', 'alternate', 'alternate'),
  '?': operator('?', 'repeat01', 'repeat', { concatAfter: true }),
  '*': operator('*', 'repeat0N', 'repeat', { concatAfter: true }),
  '+': operator('+', 'repeat1N', 'repeat', { concatAfter: true }),

  '(': operator('(', 'parenOpen', 'parenOpen'),
  ')': operator(')', 'parenClose', 'parenClose', { concatAfter: true }),
  '[': operator('[', 'bracketOpen', 'bracketOpen'),
  ']': operator(']', 'bracketClose', 'bracketClose', { concatAfter: true }),
};

//------------------------------------------------------------------------------

const Tokens = { types, charLiteral, escapedLiteral, concat };

export default Tokens;
