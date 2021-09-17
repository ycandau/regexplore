//------------------------------------------------------------------------------
// Parser class
//------------------------------------------------------------------------------

import { descriptions } from './re_static_info';

import parse from './re_parse';
import validate from './re_validate';
import convertToRPN from './re_rpn';
import compile from './re_compile';
import graph from './re_graph';

//------------------------------------------------------------------------------

const typeToDisplayType = {
  charLiteral: 'value',
  escapedChar: 'value',
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

const isNotIn = (...args) => (s) => !args.includes(s);

const merge = (obj1, obj2, filter = () => true) => {
  Object.keys(obj2)
    .filter(filter)
    .forEach((key) => (obj1[key] = obj2[key]));
};

const concatLabels = (descriptions, begin, end) => {
  let str = '';
  for (let index = begin; index <= end; index++) {
    str += descriptions[index].label;
  }
  return str;
};

//------------------------------------------------------------------------------

class Parser {
  constructor(input) {
    const { lexemes, tokens, warnings } = parse(input);
    this.tokens = validate(tokens, warnings);
    this.rpn = convertToRPN(tokens, lexemes);

    this.descriptions = lexemes;
    this.warnings = warnings;
    this.nfa = null;

    this.compile();
  }

  //----------------------------------------------------------------------------

  compile() {
    const { nfa, nodes } = compile(this.rpn);
    this.nfa = nfa;
    this.nodes = nodes;

    // Merge compile information from tokens back into descriptions
    const filter = isNotIn('label', 'type', 'match');

    this.rpn.forEach((token) => {
      if (token.type === '~') return;
      merge(this.descriptions[token.index], token, filter);
    });

    // Generate editorInfo object
    this.editorInfo = this.descriptions.map((descrip) => ({
      ...descrip,
      displayType: typeToDisplayType[descrip.type],
    }));

    this.graph = graph(nodes);
  }

  //----------------------------------------------------------------------------

  tokenInfo(index) {
    const token = this.descriptions[index];

    // @bug: Issue when deleting under hover
    if (token === undefined) return undefined;

    const type = token.type === 'charClass' ? token.label : token.type;

    const operands = [];
    if (token.begin !== undefined && token.end !== undefined) {
      operands.push(
        concatLabels(this.descriptions, token.begin + 1, token.end - 1)
      );
    }
    if (token.beginL !== undefined && token.endL !== undefined) {
      operands.push(concatLabels(this.descriptions, token.beginL, token.endL));
    }
    if (token.beginR !== undefined && token.endR !== undefined) {
      operands.push(concatLabels(this.descriptions, token.beginR, token.endR));
    }

    const info = { pos: token.pos, label: token.label, ...descriptions[type] };
    if (operands.length) info.operands = operands;
    return info;
  }

  //----------------------------------------------------------------------------

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
    return stack[0] || '';
  }
}

//------------------------------------------------------------------------------

export default Parser;
