//------------------------------------------------------------------------------
// Compile the regex and generate all the necessary data structures
//------------------------------------------------------------------------------

import parse from './re_parse';
import validate from './re_validate';
import convertToRPN from './re_rpn';
import buildNFA from './re_nfa';
import buildGraph from './re_graph';
import generateRegexFromRPN from './re_autofix';

//------------------------------------------------------------------------------

const compile = (regexString) => {
  const { lexemes, tokens, warnings } = parse(regexString);
  const validTokens = validate(tokens, lexemes, warnings);
  const rpn = convertToRPN(validTokens, lexemes);
  const nfa = buildNFA(rpn, lexemes);
  const graph = buildGraph(nfa);
  const autofix = generateRegexFromRPN(rpn);

  return { lexemes, nfa, graph, warnings, autofix };
};

//------------------------------------------------------------------------------

export default compile;
