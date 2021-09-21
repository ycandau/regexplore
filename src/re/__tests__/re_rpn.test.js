//------------------------------------------------------------------------------
// Test the RPN conversion
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import parse from '../re_parse';
import validate from '../re_validate';
import convertToRPN from '../re_rpn';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const paren = (type, index, begin, end) => ({
  type,
  index,
  begin,
  end,
  argType: 'parenthesis',
});

//------------------------------------------------------------------------------

const testRPN = (regex, rpnExpected, args = []) => {
  it(`converts the regex ${regex}`, () => {
    const { lexemes, tokens, warnings } = parse(regex);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);

    expect(labelString(rpn)).toBe(rpnExpected);

    args
      .filter(({ argType }) => argType === 'parenthesis')
      .forEach(({ type, index, begin, end }) => {
        const parenthesis = lexemes[index];
        expect(parenthesis.type).toBe(type);
        expect(parenthesis.begin).toBe(begin);
        expect(parenthesis.end).toBe(end);
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: RPN conversion', () => {
  testRPN('abc', 'ab~c~');
  testRPN('a|b|c', 'ab|c|');
  testRPN('a*', 'a*');
  testRPN('a?', 'a?');
  testRPN('a+', 'a+');
  testRPN('ab|c*d|ef?|g+h', 'ab~c*d~|ef?~|g+h~|');

  testRPN('(a)', 'a(', [paren('(', 0, 0, 2), paren(')', 2, 0, 2)]);
  testRPN('(a', 'a(', [paren('(', 0, 0, 0)]);

  testRPN('(ab)', 'ab~(', [paren('(', 0, 0, 3), paren(')', 3, 0, 3)]);
  testRPN('(ab', 'ab~(', [paren('(', 0, 0, 0)]);

  testRPN('a(bc)d', 'abc~(~d~', [paren('(', 1, 1, 4), paren(')', 4, 1, 4)]);
  testRPN('a(bcd', 'abc~d~(~', [paren('(', 1, 1, 1)]);

  testRPN('a(b(c))d', 'abc(~(~d~', [paren('(', 3, 3, 5), paren(')', 5, 3, 5)]);

  testRPN('a(b|c)(d*)+(e?)', 'abc|(~d*(+~e?(~');
});
