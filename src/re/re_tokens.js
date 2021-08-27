//------------------------------------------------------------------------------
// Constants

const DIGITS = '0123456789';
const WORDS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const SPACES = ' \\f\\n\\r\\t\\v';

//------------------------------------------------------------------------------
// Create matching functions from a label or string

const match = (label) => (ch) => ch === label;

const matchInSet = (set) => (ch) => set.has(ch);

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
//   - label: the label from the input string
//   - id:    used to retrieve the token, same as label for static tokens
//   - type:  used for common actions

const concatAfter = true; // add implicit concatenation after

const matcher = (label, id, type, match) => ({
  label,
  id,
  type,
  match,
  concatAfter,
});

const charClass = (label, match) => matcher(label, label, 'charClass', match);

const operator = (label, type, config) => ({
  label,
  id: label,
  type,
  ...config,
});

//------------------------------------------------------------------------------
// Token type object

const tokens = {
  // Static matcher tokens
  '.': matcher('.', '.', 'wildcard', () => true),

  '\\d': charClass('\\d', matchIn(DIGITS)),
  '\\D': charClass('\\D', matchNotIn(DIGITS)),
  '\\w': charClass('\\w', matchIn(DIGITS + WORDS)),
  '\\W': charClass('\\W', matchNotIn(DIGITS + WORDS)),
  '\\s': charClass('\\s', matchIn(SPACES)),
  '\\S': charClass('\\S', matchNotIn(SPACES)),

  // Static operator tokens
  '|': operator('|', 'alternate'),
  '?': operator('?', 'repeat', { concatAfter }),
  '*': operator('*', 'repeat', { concatAfter }),
  '+': operator('+', 'repeat', { concatAfter }),
  '(': operator('(', 'parenOpen'),
  ')': operator(')', 'parenClose', { concatAfter }),

  // Implicit concatenation token
  concat: operator('~', 'concat'),

  // Dynamic tokens (labels depend on source)
  charLiteral: (label) =>
    matcher(label, 'charLiteral', 'charLiteral', match(label)),

  escapedChar: (label) =>
    matcher(label, 'escapedChar', 'escapedChar', match(label[1])),

  bracketClass: (label, matches) =>
    matcher(label, 'bracketClass', 'bracketClass', matchInSet(matches)),
};

//------------------------------------------------------------------------------

export default tokens;
