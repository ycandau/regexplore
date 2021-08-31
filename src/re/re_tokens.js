// import State from './re_states.js';

import {
  /* Fragment, */ concat,
  // alternate,
  // repeat01,
  // repeat0N,
  // repeat1N,
} from './re_fragments.js';

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
// Compilation functions

// const compileMatcher = (fragments, token) => {
//   const state = new State(token.label, 'value', { match: token.match });
//   const fragment = new Fragment(state, [state]);
//   fragments.push(fragment);
// };

// const unary = (operation) => (fragments) => {
//   const frag = fragments.pop();
//   fragments.push(operation(frag));
// };

const binary = (operation) => (fragments) => {
  const frag2 = fragments.pop();
  const frag1 = fragments.pop();
  fragments.push(operation(frag1, frag2));
};

//------------------------------------------------------------------------------
// Create token types

const value = (label, type, match) => ({
  label,
  type,
  match,
  // compile: compileMatcher,
});

const charClass = (label, match) => value(label, 'charClass', match);

const operator = (label, config) => ({
  label,
  type: label,
  // compile,
  ...config,
});

//------------------------------------------------------------------------------

const tokens = {
  // Static value tokens
  '.': value('.', '.', () => true),

  '\\d': charClass('\\d', matchIn(DIGITS)),
  '\\D': charClass('\\D', matchNotIn(DIGITS)),
  '\\w': charClass('\\w', matchIn(DIGITS + WORDS)),
  '\\W': charClass('\\W', matchNotIn(DIGITS + WORDS)),
  '\\s': charClass('\\s', matchIn(SPACES)),
  '\\S': charClass('\\S', matchNotIn(SPACES)),

  // Static operator tokens
  '|': operator('|'),
  '?': operator('?'),
  '*': operator('*'),
  '+': operator('+'),
  '(': operator('('),
  ')': operator(')'),

  // '|': operator('|', binary(alternate)),
  // '?': operator('?', unary(repeat01), { concatAfter }),
  // '*': operator('*', unary(repeat0N), { concatAfter }),
  // '+': operator('+', unary(repeat1N), { concatAfter }),
  // '(': operator('(', null),
  // ')': operator(')', null, { concatAfter }),
};

//------------------------------------------------------------------------------

const getToken = (label, pos = null) => {
  const ch = label[0];
  if (ch in tokens) {
    return { ...tokens[ch], pos };
  }

  if (label in tokens) {
    return { ...tokens[label], pos };
  }

  if (label[0] === '\\') {
    const token = value(label, 'escapedChar', match(label[1]));
    token.pos = pos;
    return token;
  }

  const token = value(ch, 'charLiteral', match(ch));
  token.pos = pos;
  return token;
};

const getEmpty = () => value('0', 'empty', null);

const getConcat = () => operator('~', 'concat', binary(concat));

const getBracketClass = (label, info) => {
  const match = info.negate ? matchNotIn(info.matches) : matchIn(info.matches);
  return {
    ...value(label, 'bracketClass', match),
    ...info,
  };
};

//------------------------------------------------------------------------------

export { getToken, getConcat, getBracketClass, getEmpty };
