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

const validate = (tokens, warnings) => {
  validateParentheses(tokens, warnings);
  validateEmptyValues(tokens, warnings);
};

//------------------------------------------------------------------------------

const filterTokens = (tokens) => tokens.filter((token) => !token.invalid);

const isQuantifier = (token) => ['?', '*', '+'].includes(token.type);

const isValue = (token) =>
  token.type && token.type !== '|' && token.type !== '(';

//------------------------------------------------------------------------------

const ppParentheses = () => {
  if (this.tokens.length === 0) return 0;
  let parens = [];
  let countErrors = 0;

  for (const token of this.tokens) {
    if (token.type === '(') {
      parens.push(token);
    }
    if (token.type === ')') {
      // Syntax error: missing opening parenthesis
      if (parens.length === 0) {
        this.addWarning(')', token.pos, token.index);
        this.describe({ warning: ')' }, token.index);
        token.invalid = true;
        countErrors++;
      }
      parens.pop();
    }
  }
  // Syntax error: missing closing parenthesis
  while (parens.length > 0) {
    const open = parens.pop();
    const close = getParenClose(open.pos, open.index);
    this.tokens.push(close);
    this.addWarning('(', open.pos, open.index);
    countErrors++;
  }

  this.tokens = filterTokens(this.tokens);
  return countErrors;
};

//------------------------------------------------------------------------------

const ppQuantifiers = () => {
  if (this.tokens.length === 0) return 0;
  let prevToken = {};
  let countErrors = 0;

  for (const token of this.tokens) {
    switch (token.type) {
      case '?':
      case '*':
      case '+':
        // Syntax error: redundant quantifiers
        if (isQuantifier(prevToken)) {
          const label = `${prevToken.type}${token.type}`;
          const sub = label === '??' ? '?' : label === '++' ? '+' : '*';
          prevToken.label = sub;
          prevToken.type = sub;
          // const msg = `The parser is substituting '${label}' with '${sub}'`;
          this.addWarning('**', token.pos, token.index, { label });
          this.describe({ warning: '**' }, token.index);
          token.invalid = true;
          countErrors++;
        }

        // Syntax error: no value before quantifier
        else if (!isValue(prevToken)) {
          const label = token.type;
          this.addWarning('E*', token.pos, token.index, { label });
          this.describe({ warning: 'E*' }, token.index);
          token.invalid = true;
          countErrors++;
        } else {
          prevToken = token;
        }
        break;
      default:
        prevToken = token;
        break;
    }
  }
  this.tokens = filterTokens(this.tokens);
  return countErrors;
};

//------------------------------------------------------------------------------

const ppAlternationsForward = () => {
  if (this.tokens.length === 0) return 0;
  let prevToken = {};
  let countErrors = 0;

  for (const token of this.tokens) {
    switch (token.type) {
      case '|':
        // Syntax error: no value before alternation
        if (!isValue(prevToken)) {
          const label = token.type;
          this.addWarning('E|', token.pos, token.index, { label });
          this.describe({ warning: 'E|' }, token.index);
          token.invalid = true;
          countErrors++;
        } else {
          prevToken = token;
        }
        break;
      default:
        prevToken = token;
        break;
    }
  }
  this.tokens = filterTokens(this.tokens);
  return countErrors;
};

//------------------------------------------------------------------------------

const ppAlternationsBackward = () => {
  if (this.tokens.length === 0) return 0;
  let prevToken = { type: ')' };
  let countErrors = 0;

  for (let i = this.tokens.length - 1; i >= 0; i--) {
    const token = this.tokens[i];
    switch (token.type) {
      case '|':
        // Syntax error: no value after alternation
        if (prevToken.type === ')') {
          const label = token.type;
          this.addWarning('|E', token.pos, token.index, { label });
          this.describe({ warning: '|E' }, token.index);
          token.invalid = true;
          countErrors++;
        }
        break;
      default:
        break;
    }
    prevToken = token;
  }
  this.tokens = filterTokens(this.tokens);
  return countErrors;
};

//------------------------------------------------------------------------------

const ppEmptyParentheses = () => {
  if (this.tokens.length === 0) return 0;
  let prevToken = {};
  let countErrors = 0;

  for (let i = 0; i < this.tokens.length; i++) {
    const token = this.tokens[i];

    if (prevToken.type === '(' && token.type === ')') {
      prevToken.invalid = true;
      token.invalid = true;
      this.addWarning('()', prevToken.pos, prevToken.index);
      this.describe({ warning: '()' }, prevToken.index);
      countErrors++;
    }
    prevToken = token;
  }

  this.tokens = filterTokens(this.tokens);
  return countErrors;
};

//------------------------------------------------------------------------------

const preProcess = () => {
  let countErrors = 0;
  do {
    countErrors = 0;
    countErrors += this.ppParentheses();
    countErrors += this.ppQuantifiers();
    countErrors += this.ppAlternationsForward();
    countErrors += this.ppAlternationsBackward();
    countErrors += this.ppEmptyParentheses();
  } while (countErrors > 0);
};

//------------------------------------------------------------------------------

export { validate };
