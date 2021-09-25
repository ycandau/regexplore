//------------------------------------------------------------------------------
// Compile the regex and generate all the necessary data structures
//
// Lexemes:
//   - Used for syntax highlighting.
//   - Created during parsing phase.
//   - Mutated:
//     - Invalid lexemes during validation.
//     - Parentheses ranges during RPN conversion.
//     - Operand ranges during NFA built.
//
// NFA:
//   - Used for running the regex.
//   - Created from the RPN array of tokens.
//   - Mutated:
//     - Graph layout calculation and indexes to the graph nodes.
//
// Graph:
//   - Used for the graph display.
//   - Includes:
//     - Nodes with coordinates.
//     - Links (one to one connections).
//     - Forks (one to many connections).
//     - Merges (many to one connections).
//     - Parentheses with quantifiers.
//
// Warnings:
//   - Used for feedback to the user.
//   - Generated during the parsing phase and the validation phase.
//
// Summary:
//   - Parse to generate lexemes and tokens.
//   - Validate the tokens.
//   - Convert to RPN (add parentheses ranges).
//   - Build the NFA and some graph information (add operand ranges).
//   - Calculate the graph layout.
//------------------------------------------------------------------------------

import parse from './re_parse';
import validate from './re_validate';
import convertToRPN from './re_rpn';
import buildNFA from './re_nfa';
import buildGraph from './re_graph';
import { initNFA, stepForward } from './re_run';

import generateRegexFromRPN from './re_autofix';
import getTokenInfo from './re_token_info';

//------------------------------------------------------------------------------

const compile = (regex) => {
  const { lexemes, tokens, warnings } = parse(regex);
  const validTokens = validate(tokens, lexemes, warnings);
  const rpn = convertToRPN(validTokens, lexemes);
  const nfa = buildNFA(rpn, lexemes);
  const graph = buildGraph(nfa);

  return {
    lexemes,
    nfa,
    graph,
    warnings,
    getTokenInfo: getTokenInfo(lexemes),
    autofix: generateRegexFromRPN(rpn),
    init: initNFA(nfa),
    step: stepForward,
  };
};

//------------------------------------------------------------------------------

export default compile;
