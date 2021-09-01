//------------------------------------------------------------------------------
// Parser class
//------------------------------------------------------------------------------

import { logHeading, toString, inspect } from './re_helpers.js';

import { getToken, getConcat, getBracketClass, getEmpty } from './re_tokens.js';

import { compile, logGraph } from './re_nfa.js';
import { warnings } from './re_static_info.js';

//------------------------------------------------------------------------------

const typeToDisplayType = {
  charLiteral: 'value',
  escapedChar: 'value-special',
  charClass: 'value-special',
  bracketChar: 'value',
  bracketRangeLow: 'value-special',
  bracketRangeHigh: 'value-special',
  '.': 'value-special',
  '?': 'quantifier',
  '*': 'quantifier',
  '+': 'quantifier',
  '|': 'operator',
  '(': 'delimiter',
  ')': 'delimiter',
  '[': 'delimiter',
  ']': 'delimiter',
  '-': 'value-special',
  '^': 'operator',
};

//------------------------------------------------------------------------------

const isValue = (token) =>
  token.type && token.type !== '|' && token.type !== '(';

const isQuantifier = (token) => ['?', '*', '+'].includes(token.type);

// const isNot = (str) => (s) => s !== str;
const isNotIn = (...args) => (s) => !args.includes(s);

const merge = (obj1, obj2, filter = () => true) => {
  Object.keys(obj2)
    .filter(filter)
    .forEach((key) => (obj1[key] = obj2[key]));
};

//------------------------------------------------------------------------------

class Parser {
  constructor(input) {
    this.input = input; // unprocessed input string

    // Temporary state properties used during parsing
    this.pos = 0;
    this.operators = [];

    // Data structures generated by the parser
    this.rpn = [];
    this.descriptions = [];
    this.warnings = [];

    // Data structures generated by the compiler
    this.nfa = null;

    this.parse();
    this.compile();
  }

  //----------------------------------------------------------------------------
  // Helpers

  ch(shift = 0) {
    return this.input[this.pos + shift];
  }

  slice(length) {
    return this.input.slice(this.pos, this.pos + length);
  }

  code(shift = 0) {
    return this.input.charCodeAt(this.pos + shift);
  }

  remaining() {
    return this.input.length - this.pos;
  }

  currentIndex() {
    return this.descriptions.length - 1;
  }

  logStr() {
    logHeading('Input');
    console.log(`  ${this.input}`);
  }

  logWarnings() {
    logHeading('Warnings');
    this.warnings.forEach((warning) => console.log(`  ${toString(warning)}`));
  }

  log() {
    this.logStr();
    this.logRPN();
    this.logDescriptions();
    this.logWarnings();
    this.logGraph();
  }

  //----------------------------------------------------------------------------
  // Convert to Reverse Polish Notation (RPN)

  // Read the next token and advance the position in the input string
  readToken() {
    // Bracket expressions
    if (this.ch() === '[') {
      return this.readBracketExpression();
    }

    const token = getToken(this.slice(2), this.pos, this.currentIndex() + 1);
    this.addDescription(token.label, token.type);
    this.pos += token.label.length;
    return token;
  }

  topOperatorIs(label) {
    const operator = this.operators[this.operators.length - 1];
    return operator !== undefined && operator.label === label;
  }

  // Transfer the stacked operator to the RPN queue if it is at the top
  transferOperator(ch) {
    if (this.topOperatorIs(ch)) {
      const operator = this.operators.pop();
      this.rpn.push(operator);
    }
  }

  // Add an implicit concat when necessary
  concat() {
    this.transferOperator('~');
    this.operators.push(getConcat());
  }

  // Generate a queue of tokens in reverse polish notation (RPN)
  // using a simplified shunting-yard algorithm
  parse() {
    let openParenCount = 0;
    let prevToken = {};
    while (this.remaining()) {
      let skipped = false;
      const token = this.readToken();

      switch (token.type) {
        case 'charLiteral':
        case 'escapedChar':
        case 'charClass':
        case 'bracketClass':
        case '.':
          if (isValue(prevToken)) this.concat();
          this.rpn.push(token);
          break;

        case '|':
          // Edge case: empty token before parenthesis
          if (!isValue(prevToken)) this.rpn.push(getEmpty());

          this.transferOperator('~');
          this.transferOperator('|');
          this.operators.push(token);
          break;

        case '?':
        case '*':
        case '+':
          // Edge case: redundant quantifiers
          if (isQuantifier(prevToken)) {
            const pair = `${prevToken.type}${token.type}`;
            const sub = pair === '??' ? '?' : pair === '++' ? '+' : '*';
            prevToken.label = sub;
            prevToken.type = sub;
            const msg = `Parser substituting '${pair}' with '${sub}'`;
            this.addWarning('!**', token.pos, { msg });
            this.describe({ warning: '!**' });
            skipped = true;
            break;
          }

          // Edge case: no value before quantifier
          if (!isValue(prevToken)) {
            this.addWarning('!E', token.pos);
            this.describe({ warning: '!E' });
            skipped = true;
            break;
          }

          this.rpn.push(token);
          break;

        case '(':
          if (isValue(prevToken)) this.concat();
          token.begin = this.currentIndex();
          this.operators.push(token);
          openParenCount++;
          break;

        case ')':
          // Edge case: missing opening parenthesis
          if (openParenCount === 0) {
            this.addWarning('!(', token.pos);
            this.describe({ warning: '!(' });
            skipped = true;
            break;
          }

          // Edge case: empty token before parenthesis
          if (!isValue(prevToken)) this.rpn.push(getEmpty());

          this.transferOperator('~');
          this.transferOperator('|');

          const open = this.operators.pop();
          const begin = open.begin;
          const end = this.currentIndex();
          open.end = end;

          this.rpn.push(open);
          this.describe({ begin, end }, begin);
          this.describe({ begin, end }, end);
          openParenCount--;
          break;

        default:
          break;
      }
      if (!skipped) prevToken = token;
    }

    // Edge cases: terminal character is '|'
    const top = this.operators[this.operators.length - 1];
    if (top && top.type === '|' && top.pos === this.input.length - 1) {
      this.operators.pop();
    }

    // Edge cases: terminal character is '('
    if (top && top.type === '(' && top.pos === this.input.length - 1) {
      this.operators.pop();
      this.operators.pop();
    }

    do {
      this.transferOperator('~');
      this.transferOperator('|');

      // Edge case: missing closing parenthesis
      if (this.topOperatorIs('(')) {
        const open = this.operators.pop();
        const begin = open.begin;
        const end = begin;

        this.rpn.push(open);
        this.addWarning('!)', begin);
        this.describe({ begin, end }, begin);
      }
    } while (this.operators.length > 0);
  }

  // Log the token queue
  logRPN() {
    logHeading('Tokens');
    this.rpn.forEach(inspect());
  }

  //----------------------------------------------------------------------------
  // Descriptions

  addDescription(label, type) {
    const index = this.currentIndex() + 1;
    const pos = this.pos;
    this.descriptions.push({ index, pos, label, type });
  }

  describe(info, index) {
    const ind = index !== undefined ? index : this.currentIndex();
    const description = this.descriptions[ind];
    for (const key in info) description[key] = info[key];
  }

  logDescriptions() {
    logHeading('Descriptions');
    this.descriptions.forEach(inspect());
  }

  //----------------------------------------------------------------------------
  // Bracket expressions

  eatToken(type) {
    this.addDescription(this.ch(), type);
    this.pos++;
  }

  tryEatToken(type) {
    if (this.ch() === type) {
      this.addDescription(type, type);
      this.pos++;
      return true;
    }
    return false;
  }

  readBracketChar(matches) {
    this.addDescription(this.ch(), 'bracketChar');
    matches.add(this.ch());
    this.pos++;
  }

  tryReadBracketChar(label, matches) {
    if (this.ch() === label) {
      this.addDescription(label, 'bracketChar');
      matches.add(label);
      this.pos++;
      return true;
    }
    return false;
  }

  tryReadBracketRange(matches) {
    if (this.remaining() < 3 || this.ch(1) !== '-' || this.ch(2) === ']') {
      return false;
    }

    const rangeLow = this.code(0);
    const rangeHigh = this.code(2);
    for (let i = rangeLow; i <= rangeHigh; i++) {
      matches.add(String.fromCharCode(i));
    }

    this.eatToken('bracketRangeLow');
    this.eatToken('-');
    this.eatToken('bracketRangeHigh');

    return true;
  }

  readBracketExpression() {
    const pos = this.pos;

    this.eatToken('[');
    const set = new Set();
    const begin = this.currentIndex();
    const negate = this.tryEatToken('^');

    // Special characters are treated as literals at the beginning
    this.tryReadBracketChar(']', set) || this.tryReadBracketChar('-', set);

    // Try char range, otherwise read char literal
    while (this.remaining() && this.ch() !== ']') {
      this.tryReadBracketRange(set) || this.readBracketChar(set);
    }

    // Finalize
    const end = this.currentIndex() + 1;
    const matches = [...set].join('');
    const info = { begin, end, negate, matches };
    this.describe(info, begin);

    // Edge case: missing closing bracket
    const hasClosingBracket = this.ch() === ']';
    if (hasClosingBracket) {
      this.eatToken(']');
      this.describe(info, end);
    } else {
      this.addWarning('!]', begin);
    }

    const closingBracket = hasClosingBracket ? '' : ']';
    const label = this.input.slice(pos, this.pos) + closingBracket;
    return getBracketClass(label, { ...info, pos, index: begin });
  }

  //----------------------------------------------------------------------------
  // Compile NFA

  compile() {
    this.nfa = compile(this.rpn);

    // Merge compile information from tokens back into descriptions
    const filter = isNotIn('label', 'type', 'match');

    this.rpn.forEach((token) => {
      if (token.type === '~') return;
      merge(this.descriptions[token.index], token, filter);
    });

    this.editorInfo = this.descriptions.map((descrip) => ({
      ...descrip,
      displayType: typeToDisplayType[descrip.type],
    }));
  }

  logGraph() {
    logHeading('NFA');
    logGraph(this.nfa);
  }

  //----------------------------------------------------------------------------
  // Generate editor info

  //----------------------------------------------------------------------------
  // Apply fixes

  addWarning(type, pos, config) {
    const warning = { pos, ...warnings[type], ...config };
    this.warnings.push(warning);
  }

  fix() {
    let stack = [];
    this.rpn.forEach((token) => {
      let str1 = '';
      let str2 = '';
      switch (token.type) {
        case 'charLiteral':
        case 'escapedChar':
        case 'charClass':
        case 'bracketClass':
        case '.':
          stack.push(token.label);
          break;
        case 'empty':
          stack.push('');
          break;
        case '?':
        case '*':
        case '+':
          str1 = stack.pop();
          stack.push(str1 + token.label);
          break;
        case '|':
          str1 = stack.pop();
          str2 = stack.pop();
          stack.push(str2 + '|' + str1);
          break;
        case '(':
          str1 = stack.pop();
          stack.push('(' + str1 + ')');
          break;
        case '~':
          str1 = stack.pop();
          str2 = stack.pop();
          stack.push(str2 + str1);
          break;
        default:
          break;
      }
    });
    return stack[0];
  }
}

//------------------------------------------------------------------------------

export default Parser;

// const parser = new Parser('\\w\\a[01a-d](345|78+)*23');
// parser.log();
