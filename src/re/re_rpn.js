//------------------------------------------------------------------------------
// Convert the regex to reverse polish notation
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { describe, getConcat } from './re_parse';

//------------------------------------------------------------------------------

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
        token.begin = token.index;
        operators.push(token);
        break;

      case ')':
        transferOperator('~', rpn, operators);
        transferOperator('|', rpn, operators);
        const open = operators.pop();
        open.end = token.index;
        rpn.push(open);

        const info = { begin: open.index, end: token.index };
        describe(lexemes[open.index], info);
        describe(lexemes[token.index], info);
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
