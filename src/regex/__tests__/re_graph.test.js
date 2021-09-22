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

const fork = (...coords) => ({ coords, argType: 'fork' });

const merge = (...coords) => ({ coords, argType: 'merge' });

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

    args
      .filter(({ argType }) => argType === 'fork')
      .forEach(({ coords }) => {
        const fork = graph.forks.filter(
          (crd) => crd[0][0] === coords[0][0] && crd[0][1] === coords[0][1]
        )[0];

        expect(fork.length).toBe(coords.length);
        fork.forEach((coord, index) => {
          expect(coord[0]).toBe(coords[index][0]);
          expect(coord[1]).toBe(coords[index][1]);
        });
      });

    args
      .filter(({ argType }) => argType === 'merge')
      .forEach(({ coords }) => {
        const merge = graph.merges.filter(
          (crd) => crd[0][0] === coords[0][0] && crd[0][1] === coords[0][1]
        )[0];

        expect(merge.length).toBe(coords.length);
        merge.forEach((coord, index) => {
          expect(coord[0]).toBe(coords[index][0]);
          expect(coord[1]).toBe(coords[index][1]);
        });
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Graph display build', () => {
  const args1 = [node('a', 1, 0), node('b', 2, 0), node('c', 3, 0)];
  testGraph('abc', '>abc>', args1);

  const args2 = [
    node('a', 1, -0.5),
    node('b', 2, -0.5),
    node('c', 1, 0.5),
    fork([0, 0], [1, -0.5], [1, 0.5]),
    merge([3, 0], [2, -0.5], [1, 0.5]),
  ];
  testGraph('ab|c', '>|abc>', args2);

  const args3 = [
    node('(', 1, 0),
    node('a', 2, -0.5),
    node('b', 2, 0.5),
    node('c', 3, 0.5),
    node(')', 4, 0),
    node('d', 5, 0),
    fork([1, 0], [2, -0.5], [2, 0.5]),
    merge([4, 0], [2, -0.5], [3, 0.5]),
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
    fork([1, 0], [2, -1], [2, 0], [2, 1]),
    merge([6, 0], [2, -1], [2, 0], [5, 1]),
  ];
  testGraph('(a?|b*|(cd)+)?e', '>(|ab(cd))e>', args4);

  const args5 = [
    node('a', 2, -1.75),
    node('b', 2, -0.75),
    node('c', 5, -2.25),
    node('d', 5, -1.25),
    node('e', 5, -0.25),
    node('f', 1, 1.25),
    node('g', 3, 1.25),
    node('h', 5, 0.75),
    node('i', 5, 1.75),
    node('j', 7, 1.25),
    node('k', 9, 1.25),
    fork([0, 0], [1, -1.25], [1, 1.25]),
    merge([10, 0], [6, -1.25], [9, 1.25]),
    fork([1, -1.25], [2, -1.75], [2, -0.75]),
    merge([3, -1.25], [2, -1.75], [2, -0.75]),
    fork([4, -1.25], [5, -2.25], [5, -1.25], [5, -0.25]),
    merge([6, -1.25], [5, -2.25], [5, -1.25], [5, -0.25]),
    fork([4, 1.25], [5, 0.75], [5, 1.75]),
    merge([6, 1.25], [5, 0.75], [5, 1.75]),
  ];
  testGraph('(a|b)(c|d|e)|f(g(h|i)j)k', '>|(|ab)(|cde)f(g(|hi)j)k>', args5);
});
