//------------------------------------------------------------------------------
// Test the validation
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import parse from '../re_parse';
import validate from '../re_validate';

//------------------------------------------------------------------------------

const toString = (tokens) =>
  tokens
    .filter((tok) => !tok.invalid)
    .map((tok) => tok.label)
    .join('');

const warning = (type, index) => ({
  type,
  index,
  argType: 'warning',
});

//------------------------------------------------------------------------------

const testValidation = (regex, validRegex, warnLength, args = []) => {
  it(`validates the regex ${regex}`, () => {
    const { lexemes, tokens, warnings } = parse(regex);
    validate(tokens, lexemes, warnings);

    expect(toString(tokens)).toBe(validRegex);

    const warningsList = [...warnings.values()];
    const count = warningsList.reduce((sum, w) => sum + w.positions.length, 0);
    expect(count).toBe(warnLength);

    // Test warnings
    args
      .filter(({ argType }) => argType === 'warning')
      .forEach(({ type, index }) => {
        const warning = warnings.get(type);
        expect(warning.positions).toContain(index);
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Validation', () => {
  testValidation('', '', 0);
  testValidation('abc', 'abc', 0);

  // Opening parentheses

  testValidation(')', '', 1, [warning(')', 0)]);
  testValidation('a)', 'a', 1, [warning(')', 1)]);
  testValidation(')a', 'a', 1, [warning(')', 0)]);
  testValidation('a)b', 'ab', 1, [warning(')', 1)]);
  testValidation('a)b)c', 'abc', 2, [warning(')', 1), warning(')', 3)]);
  testValidation('a(b))c)d', 'a(b)cd', 2, [warning(')', 4), warning(')', 6)]);

  // Closing parentheses

  testValidation('(', '', 1, [warning('(E', 0)]);
  testValidation('a(', 'a', 1, [warning('(E', 1)]);
  testValidation('(a', '(a)', 1, [warning('(', 0)]);
  testValidation('a(b', 'a(b)', 1, [warning('(', 1)]);
  testValidation('a(b(c', 'a(b(c))', 2, [warning('(', 1), warning('(', 3)]);
  testValidation('a(b)(c(', 'a(b)(c)', 2, [warning('(', 4), warning('(E', 6)]);

  // Alternation

  testValidation('|', '', 1, [warning('E|', 0)]);
  testValidation('a|', 'a', 1, [warning('|E', 1)]);
  testValidation('|a', 'a', 1, [warning('E|', 0)]);
  testValidation('a||', 'a', 2, [warning('|E', 1), warning('E|', 2)]);
  testValidation('||a', 'a', 2, [warning('E|', 0), warning('E|', 1)]);
  testValidation('a|||b', 'a|b', 2, [warning('E|', 2), warning('E|', 3)]);

  // Empty parentheses

  testValidation('()', '', 1, [warning('()', 1)]);
  testValidation('a()', 'a', 1, [warning('()', 2)]);
  testValidation('()a', 'a', 1, [warning('()', 1)]);
  testValidation('(())', '', 2, [warning('()', 2), warning('()', 3)]);
  testValidation('(a())', '(a)', 1, [warning('()', 3)]);
  testValidation('(()a)', '(a)', 1, [warning('()', 2)]);

  // Quantifiers

  testValidation('?', '', 1, [warning('E*', 0)]);
  testValidation('*', '', 1, [warning('E*', 0)]);
  testValidation('+', '', 1, [warning('E*', 0)]);
  testValidation('**', '', 2, [warning('E*', 0), warning('E*', 1)]);
  testValidation('a??', 'a?', 1, [warning('**', 2)]);
  testValidation('a++', 'a+', 1, [warning('**', 2)]);
  testValidation('a**', 'a*', 1, [warning('**', 2)]);
  testValidation('a?*', 'a*', 1, [warning('**', 2)]);
  testValidation('a*?', 'a*', 1, [warning('**', 2)]);
  testValidation('a+*', 'a*', 1, [warning('**', 2)]);
  testValidation('a*+', 'a*', 1, [warning('**', 2)]);
  testValidation('a?+', 'a*', 1, [warning('**', 2)]);
  testValidation('a+?', 'a*', 1, [warning('**', 2)]);
  testValidation('a??+', 'a*', 2, [warning('**', 2), warning('**', 3)]);
  testValidation('a?++', 'a*', 2, [warning('**', 2), warning('**', 3)]);

  // Combination

  testValidation('*((|)(*)|(a)(+)|(?)(b))', '((a)|(b))', 10);
  testValidation('|a|(||)|(**)|b(|*)|(*|)', 'a|b', 16);
  testValidation('*|)*|)(a|)(|(b))', '(a)((b))', 8);
  testValidation('|*)|*)(|a)(b|(c))', '(a)(b|(c))', 7);
});
