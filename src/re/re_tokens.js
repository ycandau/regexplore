import State from './re_states.js';

import Fragment, {
  concat,
  alternate,
  repeat01,
  repeat0N,
  repeat1N,
} from './re_fragments.js';

//------------------------------------------------------------------------------
// Constants

const DIGITS = '0123456789';
const WORDS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const SPACES = ' \\f\\n\\r\\t\\v';

//------------------------------------------------------------------------------
// Matching functions

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
// Compilation functions

const compileMatcher = (fragments, token) => {
  const state = new State(token.label, 'matcher', { match: token.match });
  const fragment = new Fragment(state);
  fragments.push(fragment);
};

const unary = (operation) => (fragments) => {
  const frag = fragments.pop();
  fragments.push(operation(frag));
};

const binary = (operation) => (fragments) => {
  const frag2 = fragments.pop();
  const frag1 = fragments.pop();
  fragments.push(operation(frag1, frag2));
};

//------------------------------------------------------------------------------
// Create token types
//   - label: the label from the input string
//   - id:    used to retrieve the token, same as label for static tokens
//   - type:  used to determine parsing actions and colouring

const concatAfter = true; // add implicit concatenation after

const matcher = (label, id, type, match) => ({
  label,
  id,
  type,
  match,
  compile: compileMatcher,
  concatAfter,
});

const charClass = (label, match) => matcher(label, label, 'charClass', match);

const operator = (label, type, compile, config) => ({
  label,
  id: label,
  type,
  compile,
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
  '|': operator('|', 'alternate', binary(alternate)),
  '?': operator('?', 'repeat', unary(repeat01), { concatAfter }),
  '*': operator('*', 'repeat', unary(repeat0N), { concatAfter }),
  '+': operator('+', 'repeat', unary(repeat1N), { concatAfter }),
  '(': operator('(', 'parenOpen', null),
  ')': operator(')', 'parenClose', null, { concatAfter }),

  // Implicit concatenation token
  concat: operator('~', 'concat', binary(concat)),

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
