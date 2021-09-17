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
  const nfa = buildNFA(rpn, lexemes);
  const graph = buildGraph(nfa);

  return { lexemes, rpn, nfa, graph, warnings };
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

export { compile, generateRegexFromRPN };
