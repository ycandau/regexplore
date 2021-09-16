//------------------------------------------------------------------------------
// Validate the regex
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { warn } from './re_warnings';
import { getParenClose } from './re_parse';

//------------------------------------------------------------------------------

const validateParentheses = (tokens, warnings) => {
  let parentheses = [];

  for (const token of tokens) {
    switch (token.type) {
      case '(':
        parentheses.push(token);
        break;
      case ')':
        // No opening parenthesis
        if (parentheses.length === 0) {
          warn(')', token.pos, token.index, warnings);
          token.invalid = true;
          break;
        }
        parentheses.pop();
        break;
      default:
        break;
    }
  }

  // No closing parenthesis
  // Add warnings during second validation pass
  while (parentheses.length > 0) {
    const open = parentheses.pop();
    const close = getParenClose(open.pos, open.index);
    close.added = true;
    tokens.push(close);
  }
};

//------------------------------------------------------------------------------

const validateEmptyValues = (tokens, warnings) => {
  const stack = [];
  let exprIsEmpty = true;
  let termIsEmpty = true;
  let prevAlternation = null;

  for (const token of tokens) {
    if (token.invalid) continue;

    switch (token.type) {
      case 'charLiteral':
      case 'escapedChar':
      case 'charClass':
      case 'bracketClass':
      case '.':
        exprIsEmpty = false;
        termIsEmpty = false;
        break;

      case '|':
        if (termIsEmpty) {
          warn('E|', token.pos, token.index, warnings);
          token.invalid = true;
          break;
        }
        termIsEmpty = true;
        prevAlternation = token;
        break;

      case '?':
      case '*':
      case '+':
        // Empty quantifier operand
        if (termIsEmpty) {
          warn('E*', token.pos, token.index, warnings, { label: token.type });
          token.invalid = true;
          break;
        }
        break;

      case '(':
        stack.push({ termIsEmpty, exprIsEmpty, prevAlternation, open: token });
        exprIsEmpty = true;
        termIsEmpty = true;
        prevAlternation = null;
        break;

      case ')':
        const state = stack.pop();
        const open = state.open;

        // Empty and unclosed parenthesis
        if (exprIsEmpty && token.added) {
          warn('(E', open.pos, open.index, warnings);
          open.invalid = true;
          token.invalid = true;
        }

        // Empty pair of parentheses
        else if (exprIsEmpty) {
          warn('()', token.pos, token.index, warnings);
          open.invalid = true;
          token.invalid = true;
        }

        // Unclosed parenthesis
        else if (token.added) {
          warn('(', open.pos, open.index, warnings);
        }

        // Empty term before closing parenthesis
        if (prevAlternation && termIsEmpty) {
          warn('|E', prevAlternation.pos, prevAlternation.index, warnings);
          prevAlternation.invalid = true;
        }

        termIsEmpty = state.termIsEmpty && exprIsEmpty;
        exprIsEmpty = state.exprIsEmpty && exprIsEmpty;
        prevAlternation = state.prevAlternation;
        break;

      default:
        break;
    }
  }

  // Empty term at end of regex
  if (prevAlternation && termIsEmpty) {
    warn('|E', prevAlternation.pos, prevAlternation.index, warnings);
    prevAlternation.invalid = true;
  }
};

//------------------------------------------------------------------------------

const validateQuantifiers = (tokens, warnings) => {
  let prevToken = {};
  let prevIsQuantifier = false;

  for (const token of tokens) {
    if (token.invalid) continue;

    const currentIsQuantifier =
      token.type === '?' || token.type === '*' || token.type === '+';

    if (prevIsQuantifier && currentIsQuantifier) {
      const label = `${prevToken.type}${token.type}`;
      const replacement = label === '??' ? '?' : label === '++' ? '+' : '*';

      warn('**', token.pos, token.index, warnings, { label });
      token.invalid = true;
      prevToken.label = replacement;
      prevToken.type = replacement;
    } else {
      prevToken = token;
      prevIsQuantifier = currentIsQuantifier;
    }
  }
};

//------------------------------------------------------------------------------

const validate = (tokens, warnings) => {
  validateParentheses(tokens, warnings);
  validateEmptyValues(tokens, warnings);
  validateQuantifiers(tokens, warnings);

  return tokens.filter((token) => !token.invalid);
};

//------------------------------------------------------------------------------

export { validate };
