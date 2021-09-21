//------------------------------------------------------------------------------
// Test the NFA building algorithm
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import parse from '../re_parse';
import validate from '../re_validate';
import convertToRPN from '../re_rpn';
import buildNFA from '../re_nfa';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const nextNodesString = (node) =>
  node.nextNodes.map((next) => next.label).join('');

const node = (label, nextString) => ({
  label,
  nextString,
  argType: 'node',
});

const quant = (index, beginL, endL) => ({
  index,
  beginL,
  endL,
  argType: 'quantifier',
});

const altern = (index, beginL, endL, beginR, endR) => ({
  index,
  beginL,
  endL,
  beginR,
  endR,
  argType: 'alternation',
});

//------------------------------------------------------------------------------

const testNFA = (regex, nfaString, args = []) => {
  it(`converts the regex ${regex}`, () => {
    const { lexemes, tokens, warnings } = parse(regex);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);
    const nfa = buildNFA(rpn, lexemes);

    expect(labelString(nfa)).toBe(nfaString);

    args
      .filter(({ argType }) => argType === 'node')
      .forEach(({ label, nextString }) => {
        const node = nfa.filter((node) => node.label === label)[0];
        expect(nextNodesString(node)).toBe(nextString);
      });

    args
      .filter(({ argType }) => argType === 'quantifier')
      .forEach(({ index, beginL, endL }) => {
        const lexeme = lexemes[index];
        expect(lexeme.beginL).toBe(beginL);
        expect(lexeme.endL).toBe(endL);
      });

    args
      .filter(({ argType }) => argType === 'alternation')
      .forEach(({ index, beginL, endL, beginR, endR }) => {
        const lexeme = lexemes[index];
        expect(lexeme.beginL).toBe(beginL);
        expect(lexeme.endL).toBe(endL);
        expect(lexeme.beginR).toBe(beginR);
        expect(lexeme.endR).toBe(endR);
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: NFA build', () => {
  const args1 = [node('>', 'a'), node('a', 'b'), node('b', 'c')];
  testNFA('abc', '>abc>', args1);

  const args2 = [node('>', '|'), node('|', 'ac'), node('d', '>')];
  testNFA('ab|cd', '>|abcd>', args2);

  const args3 = [
    node('>', '|'),
    node('|', 'abc'),
    node('a', '>'),
    node('b', '>'),
    node('c', '>'),
  ];
  testNFA('a|b|c', '>|abc>', args3);

  testNFA('a*', '>*a>', [node('>', '*'), node('*', 'a>'), node('a', '*')]);
  testNFA('a?', '>?a>', [node('>', '?'), node('?', 'a>'), node('a', '>')]);
  testNFA('a+', '>a+>', [node('>', 'a'), node('a', '+'), node('+', 'a>')]);
});
