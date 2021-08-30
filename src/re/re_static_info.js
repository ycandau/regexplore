const descriptions = {
  charLiteral: {
    name: 'Character literal',
    description: 'Match exactly that character',
  },
  escapedChar: {
    name: 'Escaped character',
    description: 'Match exactly that character',
  },
  charClass: {
    searchByLabel: true,
  },
  '.': {
    name: 'Wildcard character',
    description: 'Match any character',
  },
  '\\d': {
    name: 'Digits character class',
    description: 'Match a single digit character (0123456789)',
  },
  '\\D': {
    name: 'Non-digits character class',
    description: 'Match a single non-digit character (0123456789)',
  },
  '\\w': {
    name: 'Alphanumeric character class',
    description: 'Match a single alphanumeric character (a-z, A-Z, 0-9, _)',
  },
  '\\W': {
    name: 'Non-alphanumeric character class',
    description: 'Match a single non-alphanumeric character (a-z, A-Z, 0-9, _)',
  },
  '\\s': {
    name: 'White space character class',
    description: 'Match a single white space character (a-z, A-Z, 0-9, _)',
  },
  '\\S': {
    label: '\\S',
    name: 'Non white space character class',
    description: 'Match a single non white space character (a-z, A-Z, 0-9, _)',
  },
  '|': {
    name: 'Alternation operator',
    description: 'Match either of the items preceding and following.',
  },
  '?': {
    name: '0 or 1 quantifier',
    description: 'Match the preceding item 0 or 1 times.',
  },
  '*': {
    name: '0 to any quantifier',
    description: 'Match the preceding item 0 or more times.',
  },
  '+': {
    name: '1 to any quantifier',
    description: 'Match the preceding item 1 or more times.',
  },
  '(': {
    name: 'Left parenthesis',
    description:
      'Open a parentheses pair to manage precedence and set a capture group',
  },
  ')': {
    name: 'Right parenthesis',
    description:
      'Close a parentheses pair to manage precedence and set a capture group',
  },
  '[': {
    name: 'Left bracket',
    description: 'Open a bracketed character class',
  },
  ']': {
    name: 'Right bracket',
    description: 'Close a bracketed character class',
  },
  bracketChar: {
    name: 'Character literal (brackets)',
    description: 'Add an alternative in a bracketed expression',
  },
  bracketRangeLow: {
    name: 'Range beginning',
    description:
      'Define the beginning of a character range in a bracketed expression',
  },
  bracketRangeHigh: {
    name: 'Range ending',
    description:
      'Define the ending of a character range in a bracketed expression',
  },
  '-': {
    name: 'Range operator',
    description:
      'Add a character range as alternatives in a bracketed expression',
    warning: 'Has to be neither at the end or beginning of the expression',
  },
  '^': {
    name: 'Negation operator',
    description: 'Negate a bracket expression to match characters not in it',
    warning: 'Has to be positioned as the first character in the expression',
  },
  empty: {
    name: 'Not hovering over anything',
  },
};

//------------------------------------------------------------------------------

const warnings = {
  '!]': {
    type: '!]',
    issue: 'An open bracket has not been closed.',
    msg: 'Parser adding an implicit closing bracket to correct the regex.',
  },
  '!)': {
    type: '!)',
    issue: 'An open parenthesis has not been closed.',
    msg: 'Parser adding an implicit closing parenthesis to correct the regex.',
  },
  '!(': {
    type: '!(',
    issue: 'A closing parenthesis has no matching opening.',
    msg: 'Parser skipping the closing parenthesis to correct the regex.',
  },
  '!E': {
    type: '!E',
    issue: 'A quantifier follows an empty value.',
    msg: 'Parser skipping the quantifier as it is of no use.',
  },
  '!**': {
    type: '!**',
    issue: 'Redundant quantifiers.',
    msg: '!**', // provided by parser
  },
};

//------------------------------------------------------------------------------

export { descriptions, warnings };
