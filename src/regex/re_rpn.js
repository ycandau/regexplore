//------------------------------------------------------------------------------
// Convert the regex to reverse polish notation
//
//   - The convertToRPN() function returns tokens in reverse polish notation.
//   - It assumes that the input tokens are already validated.
//   - And it mutates lexemes by adding information on parentheses ranges.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { getConcat } from './re_parse';

//------------------------------------------------------------------------------
// Helper function to decide when to add an implicit concatenation

const isValue = (token) =>
  token.type && token.type !== '|' && token.type !== '(';

//------------------------------------------------------------------------------
// Transfer the stacked operator to the RPN queue if it is at the top

const transferOperator = (type, rpn, operators) => {
  const top = operators[operators.length - 1];
  if (top && top.type === type) {
    const operator = operators.pop();
    rpn.push(operator);
  }
};

//------------------------------------------------------------------------------
// Add an implicit concat when necessary

const concat = (rpn, operators) => {
  transferOperator('~', rpn, operators);
  operators.push(getConcat());
};

//------------------------------------------------------------------------------
// Main conversion function

const convertToRPN = (tokens, lexemes) => {
  const rpn = [];
  const operators = [];
  let prevToken = {};

  for (const token of tokens) {
    if (token.invalid) continue;

    switch (token.type) {
      case 'charLiteral':
      case 'escapedChar':
      case 'charClass':
      case 'bracketClass':
      case '.':
        if (isValue(prevToken)) concat(rpn, operators);
        rpn.push(token);
        break;

      case '|':
        transferOperator('~', rpn, operators);
        transferOperator('|', rpn, operators);
        operators.push(token);
        break;

      case '?':
      case '*':
      case '+':
        rpn.push(token);
        break;

      case '(':
        if (isValue(prevToken)) concat(rpn, operators);
        operators.push(token);
        break;

      case ')':
        transferOperator('~', rpn, operators);
        transferOperator('|', rpn, operators);
        const open = operators.pop();
        open.end = token.index;
        rpn.push(open);

        lexemes[open.index].begin = open.index;
        lexemes[open.index].end = token.index;
        lexemes[token.index].begin = open.index;
        lexemes[token.index].end = token.index;
        break;

      default:
        throw new Error('Invalid token type');
    }
    prevToken = token;
  }
  transferOperator('~', rpn, operators);
  transferOperator('|', rpn, operators);

  return rpn;
};

//------------------------------------------------------------------------------

export default convertToRPN;
