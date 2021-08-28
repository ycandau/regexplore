//------------------------------------------------------------------------------
// Parser class
//------------------------------------------------------------------------------

import { last, logHeading } from './re_helpers.js';
import tokens from './re_tokens.js';
import State from './re_states.js';
import Fragment from './re_fragments.js';

//------------------------------------------------------------------------------

class Parser {
  constructor(input) {
    this.input = input; // unprocessed input string

    // Temporary state properties used during parsing
    this.pos = 0;
    this.prevToken = {};
    this.operators = [];

    // Data structures generated by the parser
    this.rpn = [];
    this.descriptions = [];

    // Data structures generated by the compiler
    this.firstState = null;
    this.fragments = [];
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

  logStr() {
    logHeading('Input');
    console.log(`  ${this.input}`);
  }

  log() {
    this.logStr();
    this.logTokens();
    this.logDescriptions();
    this.logGraph();

    // console.log(`Fragments [${this.fragments.length}]: ${this.fragments}`);
    // console.log(`Operators [${this.operators.length}]: ${this.operators}`);
    // console.log('Graph');
    // this.firstState.logAll();
  }

  //----------------------------------------------------------------------------
  // Convert to Reverse Polish Notation (RPN)

  // Read the next token and advance the position in the input string
  readToken() {
    const ch = this.ch();
    // Escaped characters
    if (ch === '\\') {
      const label = this.slice(2);
      const token = tokens[label] || tokens.escapedChar(label);
      token.pos = this.pos;
      this.pushDescription(label, token.id);
      this.pos += 2;
      return token;
    }
    // Bracket expressions
    if (ch === '[') {
      return this.readBracketExpression();
    }
    // Standard tokens
    const token = tokens[ch] || tokens.charLiteral(ch);
    token.pos = this.pos;
    this.pushDescription(ch, token.id);
    this.pos += 1;
    return token;
  }

  // Transfer the stacked operator to the RPN queue if it is at the top
  transferOperator(ch) {
    const operator = last(this.operators);
    if (operator && operator.label === ch) {
      this.operators.pop();
      this.rpn.push(operator);
    }
  }

  // Add an implicit concat when necessary
  concat() {
    this.transferOperator('~');
    this.operators.push(tokens.concat);
  }

  // Generate a queue of tokens in reverse polish notation (RPN)
  // using a simplified shunting-yard algorithm
  generateRPN() {
    while (this.remaining()) {
      const token = this.readToken();
      switch (token.type) {
        case 'charLiteral':
        case 'escapedChar':
        case 'charClass':
        case 'bracketClass':
        case 'wildcard':
          if (this.prevToken.concatAfter) this.concat();
          this.rpn.push(token);
          break;
        case 'alternate':
          this.transferOperator('~');
          this.transferOperator('|');
          this.operators.push(token);
          break;
        case 'repeat':
          this.rpn.push(token);
          break;
        case 'parenOpen':
          if (this.prevToken.concatAfter) this.concat();
          token.begin = this.pos - 1;
          this.operators.push(token);
          break;
        case 'parenClose':
          this.transferOperator('~');
          this.transferOperator('|');
          const begin = this.operators.pop().begin;
          const end = this.pos - 1;
          const info = { begin, end };
          this.describe(begin, info);
          this.describe(end, info);
          break;
        default:
          break;
      }
      this.prevToken = token;
    }
    this.transferOperator('~');
    this.transferOperator('|');
  }

  // Log the token queue
  logTokens() {
    logHeading('Tokens');
    this.rpn.forEach((token) => {
      const info = token.id === token.label ? token.type : token.id;
      console.log(`  ${token.label} : ${info}`);
    });
  }

  //----------------------------------------------------------------------------
  // Descriptions

  pushDescription(label, id, config = {}) {
    this.descriptions.push({ label, id, ...config });
  }

  describe(pos, info) {
    const description = this.descriptions[pos];
    for (const key in info) description[key] = info[key];
  }

  logDescriptions() {
    logHeading('Descriptions');
    this.descriptions.forEach((description) => {
      console.log(`  ${JSON.stringify(description)}`);
    });
  }

  //----------------------------------------------------------------------------
  // Bracket expressions

  eatToken(id) {
    this.pushDescription(this.ch(), id);
    this.pos++;
  }

  tryEatToken(id) {
    if (this.ch() === id) {
      this.pushDescription(id, id);
      this.pos++;
      return true;
    }
    return false;
  }

  readBracketChar(matches) {
    this.pushDescription(this.ch(), 'bracketChar');
    matches.add(this.ch());
    this.pos++;
  }

  tryReadBracketChar(label, matches) {
    if (this.ch() === label) {
      this.pushDescription(label, 'bracketChar');
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
    const begin = this.pos;
    const matchSet = new Set();

    this.eatToken('[');
    const negate = this.tryEatToken('^');

    this.tryReadBracketChar(']', matchSet) ||
      this.tryReadBracketChar('-', matchSet);

    while (this.remaining()) {
      if (this.ch() === ']') {
        const end = this.pos;
        const matches = [...matchSet].join('');
        const info = { begin, end, negate, matches };
        this.eatToken(']');
        this.describe(begin, info);
        this.describe(end, info);
        const label = this.input.slice(begin, end + 1);
        return tokens.bracketClass(label, matchSet);
      }
      this.tryReadBracketRange(matchSet) || this.readBracketChar(matchSet);
    }
    // this.raise('Bracket expression not closed.'); @todo
  }

  //----------------------------------------------------------------------------
  // Compile NFA

  compileGraph() {
    this.rpn.forEach((token) => {
      token.compile(this.fragments, token);
    });

    this.firstState = new State('>', 'first');
    this.lastState = new State('#', 'last');
    this.firstState.connectTo(this.fragments[0]).connectTo(this.lastState);
  }

  logGraph() {
    logHeading('Graph');
    this.firstState.logAll();
  }
}

//------------------------------------------------------------------------------

export default Parser;

// const parser = new Parser('a.\\d\\.(b?c|d*)e|f');
const parser = new Parser('a|b');
parser.generateRPN();
parser.compileGraph();
parser.log();
