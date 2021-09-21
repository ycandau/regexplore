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

const getToken = (tokens, index) =>
  tokens.filter((tok) => tok.index === index)[0];

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
  it(`builds the NFA for ${regex}`, () => {
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

        const label = getToken(nfa, index).label;
        const begin = getToken(nfa, lexeme.beginL);
        const end = getToken(nfa, lexeme.endL);

        expect(begin.quantifier).toBe(label);
        expect(end.quantifier).toBe(label);
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

  testNFA('a?', '>?a>', [node('>', '?'), node('?', 'a>'), node('a', '>')]);
  testNFA('a*', '>*a>', [node('>', '*'), node('*', 'a>'), node('a', '*')]);
  testNFA('a+', '>a+>', [node('>', 'a'), node('a', '+'), node('+', 'a>')]);

  const args5 = [node('a', '?'), node('?', '(d'), node(')', 'd')];
  testNFA('a(bc)?d', '>a?(bc)d>', args5);

  const args6 = [node('a', '*'), node('*', '(d'), node(')', '*')];
  testNFA('a(bc)*d', '>a*(bc)d>', args6);

  const args7 = [node('a', '('), node(')', '+'), node('+', '(d')];
  testNFA('a(bc)+d', '>a(bc)+d>', args7);

  const args8 = [quant(2, 1, 1), quant(4, 3, 3), quant(6, 5, 5)];
  testNFA('ab?c*d+e', '>a?b*cd+e>', args8);

  const args9 = [quant(4, 0, 3), quant(9, 5, 8), quant(14, 10, 13)];
  testNFA('(ab)?(cd)*(ef)+', '>?(ab)*(cd)(ef)+>', args9);

  const args10 = [quant(8, 0, 7), quant(16, 9, 15), quant(24, 17, 23)];
  testNFA('(a(bc)d)?(ef|gh)*(i|j|k)+', '>?(a(bc)d)*(|efgh)(|ijk)+>', args10);

  const args11 = [altern(1, 0, 0, 2, 2)];
  testNFA('a|b', '>|ab>', args11);

  const args12 = [altern(2, 0, 1, 3, 4), altern(5, 0, 4, 6, 9)];
  testNFA('ab|cd|(ef)', '>|abcd(ef)>', args12);

  const args13 = [altern(3, 0, 2, 4, 6), altern(7, 0, 6, 8, 12)];
  testNFA('ab?|cd*|(ef)+', '>|a?bc*d(ef)+>', args13);
});
