//------------------------------------------------------------------------------
// Test the validation
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { parse } from '../re_parse';
import { validate } from '../re_validate';

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
    const { tokens, warnings } = parse(regex);
    validate(tokens, warnings);

    expect(toString(tokens)).toBe(validRegex);
    expect(warnings.length).toBe(warnLength);

    // Test warnings
    args
      .filter(({ argType }) => argType === 'warning')
      .forEach(({ type, index }) => {
        const types = warnings
          .filter((warn) => warn.index === index)
          .map((warn) => warn.type);
        expect(types).toContain(type);
      });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Validation', () => {
  testValidation('', '', 0);
  testValidation('abc', 'abc', 0);

  testValidation(')', '', 1, [warning(')', 0)]);
  testValidation('a)', 'a', 1, [warning(')', 1)]);
  testValidation(')a', 'a', 1, [warning(')', 0)]);
  testValidation('a)b', 'ab', 1, [warning(')', 1)]);
  testValidation('a)b)c', 'abc', 2, [warning(')', 1), warning(')', 3)]);

  testValidation('|', '', 1, [warning('E|', 0)]);
  testValidation('a|', 'a', 1, [warning('|E', 1)]);
  testValidation('|a', 'a', 1, [warning('E|', 0)]);
  testValidation('a||', 'a', 2, [warning('|E', 1), warning('E|', 2)]);
  testValidation('||a', 'a', 2, [warning('E|', 0), warning('E|', 1)]);
  testValidation('a|||b', 'a|b', 2, [warning('E|', 2), warning('E|', 3)]);

  testValidation('?', '', 1, [warning('E*', 0)]);
  testValidation('*', '', 1, [warning('E*', 0)]);
  testValidation('+', '', 1, [warning('E*', 0)]);

  testValidation('()', '', 1, [warning('()', 1)]);

  testValidation('(', '', 1, [warning('(E', 0)]);
  testValidation('a(', 'a', 1, [warning('(E', 1)]);
  testValidation('(a', '(a)', 1, [warning('(', 0)]);
});
