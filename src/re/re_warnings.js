//------------------------------------------------------------------------------
// Warnings
//------------------------------------------------------------------------------

const warnings = {
  '[': {
    label: '[',
    type: '[',
    issue: 'An open bracket has not been closed',
    msg: 'The parser is adding an implicit closing bracket.',
  },
  '(': {
    type: '(',
    label: '(',
    issue: 'An open parenthesis has not been closed',
    msg: 'The parser is adding an implicit closing parenthesis.',
  },
  ')': {
    type: ')',
    label: ')',
    issue: 'A closing parenthesis has no match',
    msg: 'The parser is ignoring the closing parenthesis.',
  },
  '**': {
    type: '**',
    // label from parser
    issue: 'Redundant quantifiers',
    msg: 'The parser is simplifying the quantifiers to a single one.',
  },
  'E*': {
    type: 'E*',
    // label from parser
    issue: 'A quantifier follows an empty value',
    msg: 'The parser is ignoring the quantifier.',
  },
  'E|': {
    type: 'E|',
    label: '|',
    issue: 'An alternation follows an empty value',
    msg: 'The parser is ignoring the alternation.',
  },
  '|E': {
    type: '|E',
    label: '|',
    issue: 'An alternation precedes an empty value',
    msg: 'The parser is ignoring the alternation.',
  },
  '()': {
    type: '()',
    label: '()',
    issue: 'A pair of parentheses contains no value',
    msg: 'The parser is ignoring the parentheses.',
  },
  '(E': {
    type: '(E',
    label: '(',
    issue: 'An open parenthesis has not been closed and is empty',
    msg: 'The parser is ignoring the parenthesis.',
  },
  '\\E': {
    type: '\\E',
    label: '\\',
    issue: 'No character after backslash',
    msg: 'The parser is ignoring the backslash.',
  },
};

//------------------------------------------------------------------------------

const warn = (type, pos, index, warnings, info) => {
  const warning = { type, pos, index, ...info };
  warnings.push(warning);
};

//------------------------------------------------------------------------------

export { warn };
