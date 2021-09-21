//------------------------------------------------------------------------------
// Test the NFA building algorithm
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import parse from '../re_parse';
import validate from '../re_validate';
import convertToRPN from '../re_rpn';
import buildNFA from '../re_nfa';
import buildGraph from '../re_graph';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const node = (label, x, y) => ({ label, x, y, argType: 'node' });

//------------------------------------------------------------------------------

const testGraph = (regex, graphNodesString, args = []) => {
  it(`builds the graph display for ${regex}`, () => {
    const { lexemes, tokens, warnings } = parse(regex);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);
    const nfa = buildNFA(rpn, lexemes);
    const graph = buildGraph(nfa);

    expect(labelString(graph.nodes)).toBe(graphNodesString);

    args
      .filter(({ argType }) => argType === 'node')
      .forEach(({ label, x, y }) => {
        const node = graph.nodes.filter((node) => node.label === label)[0];
        expect(node.coord[0]).toBe(x);
        expect(node.coord[1]).toBe(y);
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Graph display build', () => {
  const args1 = [node('a', 1, 0), node('b', 2, 0), node('c', 3, 0)];
  testGraph('abc', '>abc>', args1);

  const args2 = [node('a', 1, -0.5), node('b', 2, -0.5), node('c', 1, 0.5)];
  testGraph('ab|c', '>|abc>', args2);

  const args3 = [
    node('(', 1, 0),
    node('a', 2, -0.5),
    node('b', 2, 0.5),
    node('c', 3, 0.5),
    node(')', 4, 0),
    node('d', 5, 0),
  ];
  testGraph('(a|bc)d', '>(|abc)d>', args3);

  const args4 = [
    node('(', 1, 0),
    node('a', 2, -1),
    node('b', 2, 0),
    node('c', 3, 1),
    node('d', 4, 1),
    node(')', 5, 1),
    node('e', 7, 0),
  ];
  testGraph('(a?|b*|(cd)+)?e', '>(|ab(cd))e>', args4);
});
