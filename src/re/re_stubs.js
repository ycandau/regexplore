//------------------------------------------------------------------------------
// Description

// This is an object with information on one specific token from the regex
// search string. The information is displayed in response to an onHover event
// and maybe also based on the cursor position in the string.

// The objects will have different properties depending on the type of token.

const description1 = {
  pos: 3, // position in the regex string
  label: '*', // copied from the regex string
  name: '0 to any quantifier',
  description: 'Match the preceding item 0 or more times.',
  note: 'Quantifiers have the highest operator precedence', // optional, only for some tokens
};

const description2 = {
  range: [5, 10],
  label: '(',
  name: 'Left parenthesis',
  description:
    'Open a parentheses pair to manage precedence and set a capture group.',
};

const description3 = {
  pos: 12,
  label: '^',
  name: 'Negation operator',
  description:
    'Negate a bracket expression to match characters that are not in it',
  warning:
    'It has to be the first character in the expression and will otherwise be interpreted as a regular character.',
};

//------------------------------------------------------------------------------
// Warnings and errors

// This an array which is empty if there are no warnings or errors.

const warnings = [
  {
    pos: 3,
    message: 'An open parenthesis has not been closed.',
    fix: 'The parser is adding a closing parenthesis to correct the regex.',
  },
  {
    pos: 5,
    message: 'An open bracket has not been closed.',
    fix: 'The parser is adding a closing bracket to correct the regex.',
  },
  {
    pos: 7,
    excerpt: '(*',
    message: 'A quantifier operates on an empty string.',
    fix: 'The parser is ignoring the quantifier.',
  },
  {
    pos: 10,
    excerpt: '(|',
    message: 'An alternation operates on an empty string.',
    fix: 'This is normally done with a 0 or 1 quantifier.',
  },
  {
    pos: 12,
    excerpt: '+*',
    message: 'Multiple quantifiers in succession.',
    fix: "The parser is simplifying '+*' to '*'.",
  },
];

//------------------------------------------------------------------------------
// Logs

// An array with a summary log of the step by step execution of the regex.

// Render to something such as:
// [0]: 'm' => 2 active states
// [1]: 'i' => 2 active states
// [2]: 'n' => 1 active state
// [3]: 'm' => 0 active states
// Match fails

const logs = [
  {
    pos: 0, // position in the test string
    char: 'm', // character in the test string
    count: 2, // number of active states in the NFA
  },
  {
    pos: 1,
    char: 'i',
    count: 2,
  },
  {
    pos: 2,
    char: 'n',
    count: 1,
  },
  {
    pos: 3,
    char: 't',
    count: 0,
  },
];

//------------------------------------------------------------------------------

// Example string with all cases:
// 'ab|c?.\\w\\.[^de0-9]?(+fg)

/*
  String displayed with no hover.
  The display probably only includes a color per type.

  Potential color types:

  - value: green
  - value-special: blue
  - operator: yellow
  - quantifier: orange
  - delimiter: purple
  - error: red
 */

const hlBase = [
  {
    label: 'a',
    colorType: 'value',
  },
  {
    label: 'b',
    colorType: 'value',
  },
  {
    label: '|',
    colorType: 'operator',
  },
  {
    label: 'c',
    colorType: 'value',
  },
  {
    label: '?',
    colorType: 'quantifier',
  },
  {
    label: '.',
    colorType: 'value-special',
  },
  {
    label: '\\w',
    colorType: 'value-special',
  },
  {
    label: '\\.',
    colorType: 'value-special',
  },
  {
    label: '[',
    colorType: 'delimiter',
  },
  {
    label: '^',
    colorType: 'operator',
  },
  {
    label: 'd',
    colorType: 'value',
  },
  {
    label: 'e',
    colorType: 'value',
  },
  {
    label: '0',
    colorType: 'value-special',
  },
  {
    label: '-',
    colorType: 'value-special',
  },
  {
    label: '9',
    colorType: 'value-special',
  },
  {
    label: ']',
    colorType: 'delimiter',
  },
  {
    label: '?',
    colorType: 'quantifier',
  },
  {
    label: '(',
    colorType: 'delimiter',
  },
  {
    label: '+',
    colorType: 'error',
  },
  {
    label: 'f',
    colorType: 'value',
  },
  {
    label: 'g',
    colorType: 'value',
  },
  {
    label: ')',
    colorType: 'delimiter',
  },
];

/*
  String displayed with hover.
  The display probably only includes a color per type.

  Potential hover decorations:

  More than we need maybe, but better to have all the information in case
  we want to change the styles (for instance underline to boxes).

  - hl-value: background higlight
  - hl-operator: background higlight
  - hl-delimiter: background higlight

  - hl-delimiter-begin: background + bottom border
  - hl-delimiter-inside: bottom border
  - hl-delimiter-end: background + bottom border

  - hl-left-operand-single: bottom border
  - hl-left-operand-begin: bottom border
  - hl-left-operand-inside: bottom border
  - hl-left-operand-end: bottom border

  - hl-right-operand-single: bottom border
  - hl-right-operand-begin: bottom border
  - hl-right-operand-inside: bottom border
  - hl-right-operand-end: bottom border
*/

const hlHoverValue = [
  {
    label: 'a',
    colorType: 'value',
  },
  {
    label: 'b',
    colorType: 'value',
    hoverType: 'hl-value',
  },
  {
    label: 'c',
    colorType: 'value',
  },
];

// Regex: a(bc)d
// Hover over one of the parentheses

const hlHoverParen = [
  {
    label: 'a',
    colorType: 'value',
  },
  {
    label: '(',
    colorType: 'delimiter',
    hoverType: 'hl-delimiter-begin',
  },

  {
    label: 'b',
    colorType: 'value',
    hoverType: 'hl-delimiter-inside',
  },
  {
    label: 'c',
    colorType: 'value',
    hoverType: 'hl-delimiter-inside',
  },
  {
    label: ')',
    colorType: 'delimiter',
    hoverType: 'hl-delimiter-end',
  },
  {
    label: 'd',
    colorType: 'value',
  },
];

// Regex: ab(c|def)
// Hover over alternation

const hlHoverOperator = [
  {
    label: 'a',
    colorType: 'value',
  },
  {
    label: 'b',
    colorType: 'value',
  },
  {
    label: '(',
    colorType: 'delimiter',
  },
  {
    label: 'c',
    colorType: 'value',
    hoverType: 'hl-left-operand-single',
  },
  {
    label: '|',
    colorType: 'operator',
    hoverType: 'hl-operator',
  },
  {
    label: 'd',
    colorType: 'value',
    hoverType: 'hl-right-operand-begin',
  },
  {
    label: 'e',
    colorType: 'value',
    hoverType: 'hl-right-operand-inside',
  },
  {
    label: 'f',
    colorType: 'value',
    hoverType: 'hl-right-operand-end',
  },
  {
    label: ')',
    colorType: 'delimiter',
  },
];

//------------------------------------------------------------------------------

export {
  description1,
  description2,
  description3,
  warnings,
  logs,
  hlBase,
  hlHoverValue,
  hlHoverParen,
  hlHoverOperator,
};
