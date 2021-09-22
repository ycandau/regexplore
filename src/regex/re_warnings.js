//------------------------------------------------------------------------------
// Warnings
//
//   - Warnings are aggregated by type, with arrays of positions.
//   - They are generated during two phases:
//     - Two types during parsing ('[' and '\\E').
//     - All other types during validation.
//------------------------------------------------------------------------------

const staticInformation = {
  '[': {
    label: '[',
    type: '[',
    issue: 'An open bracket has not been closed',
    msg: 'The parser is adding an implicit closing bracket.',
  },
  '\\E': {
    type: '\\E',
    label: '\\',
    issue: 'No character after backslash',
    msg: 'The parser is ignoring the backslash.',
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
};

//------------------------------------------------------------------------------

const warn = (staticInformation) => (
  type,
  pos,
  index,
  lexemes,
  warnings,
  info
) => {
  lexemes[index].invalid = true;

  if (warnings.has(type)) {
    const warning = warnings.get(type);
    warning.count += 1;
    warning.positions.push(pos);
    return;
  }

  const warning = {
    ...staticInformation[type],
    ...info,
    count: 1,
    positions: [pos],
  };
  warnings.set(type, warning);
};

//------------------------------------------------------------------------------

export default warn(staticInformation);
