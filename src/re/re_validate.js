//------------------------------------------------------------------------------
// Parse the regex
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { warn } from './re_warnings';
import { getConcat, getParenClose } from './re_parse';

//------------------------------------------------------------------------------

const validate = (tokens) => {
  const stack = [];
  let termIsEmpty = true;
  let exprIsEmpty = true;
  // let prevToken = {};

  for (const token of tokens) {
    if (token.invalid) break;

    switch (token.type) {
      case 'charLiteral':
      case 'escapedChar':
      case 'charClass':
      case 'bracketClass':
      case '.':
        termIsEmpty = false;
        exprIsEmpty = false;
        break;
      case '|':
        if (termIsEmpty) warn();
        termIsEmpty = true;
        break;
      case '?':
        if (termIsEmpty) warn();
        break;
      case '*':
        if (termIsEmpty) warn();
        break;
      case '+':
        if (termIsEmpty) warn();
        break;
      case '(':
        stack.push({ termIsEmpty, exprIsEmpty });
        exprIsEmpty = true;
        break;
      case ')':
        if (exprIsEmpty) warn();
        if (termIsEmpty) warn();
        ({ termIsEmpty, exprIsEmpty } = stack.pop());
        break;
      default:
        break;
    }

    // prevToken = token;
  }

  return tokens;
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
