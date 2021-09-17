//------------------------------------------------------------------------------
// Parser class
//------------------------------------------------------------------------------

import parse from './re_parse';
import validate from './re_validate';
import convertToRPN from './re_rpn';
import buildNFA from './re_nfa';
import buildGraph from './re_graph';

//------------------------------------------------------------------------------

const compile = (regex) => {
  const { lexemes, tokens, warnings } = parse(regex);
  const validTokens = validate(tokens, warnings);
  const rpn = convertToRPN(validTokens, lexemes);
  const { nfa, nodes } = buildNFA(rpn, lexemes);
  const graph = buildGraph(nodes);

  return { lexemes, rpn, nfa, nodes, graph, warnings };
};

//----------------------------------------------------------------------------

const concatLabels = (descriptions, begin, end) => {
  let str = '';
  for (let index = begin; index <= end; index++) {
    str += descriptions[index].label;
  }
  return str;
};

const getTokenInfo = (index, lexemes, descriptions) => {
  const token = lexemes[index];

  // @bug: Issue when deleting under hover
  if (token === undefined) return null;

  const type = token.type === 'charClass' ? token.label : token.type;

  const operands = [];
  if (token.begin !== undefined && token.end !== undefined) {
    operands.push(concatLabels(lexemes, token.begin + 1, token.end - 1));
  }
  if (token.beginL !== undefined && token.endL !== undefined) {
    operands.push(concatLabels(lexemes, token.beginL, token.endL));
  }
  if (token.beginR !== undefined && token.endR !== undefined) {
    operands.push(concatLabels(lexemes, token.beginR, token.endR));
  }

  const info = { pos: token.pos, label: token.label, ...descriptions[type] };
  if (operands.length) info.operands = operands;
  return info;
};

//----------------------------------------------------------------------------

const generateRegexFromRPN = (rpn) => {
  let stack = [];
  rpn.forEach((token) => {
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
};

//------------------------------------------------------------------------------

export { compile, getTokenInfo, generateRegexFromRPN };
