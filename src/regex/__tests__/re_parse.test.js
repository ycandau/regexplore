//------------------------------------------------------------------------------
// Test the lexer and parser
//------------------------------------------------------------------------------

import parse from '../re_parse';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const lexeme = (label, type, pos, index) => ({
  label,
  type,
  pos,
  index,
  argType: 'lexeme',
});

const token = (label, type, pos, index, passes = [], fails = []) => ({
  label,
  type,
  pos,
  index,
  passes,
  fails,
  argType: 'token',
});

const lexAndTok = (label, type, pos, index, passes = [], fails = []) => ({
  label,
  type,
  pos,
  index,
  passes,
  fails,
  argType: 'lexAndTok',
});

const bracket = (begin, end, negate) => ({
  begin,
  end,
  negate,
  argType: 'bracket',
});

const warning = (type, index) => ({
  type,
  index,
  argType: 'warning',
});

const invalid = (index) => ({
  index,
  argType: 'invalid',
});

//------------------------------------------------------------------------------

const testParser = (regex, lexlength, tokLength, warnLength, args = []) => {
  it(`parses the regex ${regex}`, () => {
    const { lexemes, tokens, warnings } = parse(regex);

    expect(lexemes.length).toBe(lexlength);
    expect(tokens.length).toBe(tokLength);
    expect(labelString(lexemes)).toBe(regex);

    const warningsList = [...warnings.values()];
    const count = warningsList.reduce((sum, w) => sum + w.positions.length, 0);
    expect(count).toBe(warnLength);

    // Test lexemes
    args
      .filter(({ argType }) => argType === 'lexeme' || argType === 'lexAndTok')
      .forEach(({ label, type, pos, index }) => {
        const lexeme = lexemes[index];
        expect(lexeme.label).toBe(label);
        expect(lexeme.type).toBe(type);
        expect(lexeme.pos).toBe(pos);
      });

    // Test tokens
    args
      .filter(({ argType }) => argType === 'token' || argType === 'lexAndTok')
      .forEach(({ label, type, pos, index, passes, fails }) => {
        const matchingTokens = tokens.filter((tok) => tok.index === index);
        expect(matchingTokens.length).toBe(1);

        const token = matchingTokens[0];
        expect(token.label).toBe(label);
        expect(token.type).toBe(type);
        expect(token.pos).toBe(pos);

        passes.forEach((ch) => {
          expect(token.match(ch)).toBe(true);
        });

        fails.forEach((ch) => {
          expect(token.match(ch)).toBe(false);
        });
      });

    // Test bracket expressions
    args
      .filter(({ argType }) => argType === 'bracket')
      .forEach(({ begin, end, negate }) => {
        const lexeme = lexemes[begin];
        expect(lexeme.begin).toBe(begin);
        expect(lexeme.end).toBe(end);
        expect(lexeme.negate).toBe(negate);
      });

    // Test warnings
    args
      .filter(({ argType }) => argType === 'warning')
      .forEach(({ type, index }) => {
        const warning = warnings.get(type);
        expect(warning.positions).toContain(index);
      });

    // Test invalid tokens
    args
      .filter(({ argType }) => argType === 'invalid')
      .forEach(({ index }) => expect(tokens[index].invalid).toBe(true));
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Parser', () => {
  testParser('', 0, 0, 0);

  const args1 = [
    lexAndTok('a', 'charLiteral', 0, 0, ['a'], ['x']),
    lexAndTok('b', 'charLiteral', 1, 1),
    lexAndTok('c', 'charLiteral', 2, 2),
  ];
  testParser('abc', 3, 3, 0, args1);

  const arg1 = lexAndTok('.', '.', 1, 1, ['a']);
  testParser('a.c', 3, 3, 0, [arg1]);

  const arg2 = lexAndTok('\\d', 'charClass', 2, 1, ['0'], ['a']);
  testParser('\\d\\d\\d', 3, 3, 0, [arg2]);

  const arg3 = lexAndTok('\\+', 'escapedChar', 2, 1, ['+'], ['a']);
  testParser('\\+\\+\\+', 3, 3, 0, [arg3]);

  const arg4 = lexAndTok('|', '|', 2, 1);
  testParser('\\a|b', 3, 3, 0, [arg4]);

  const arg5 = lexAndTok('*', '*', 3, 2);
  testParser('\\ab*', 3, 3, 0, [arg5]);

  const args2 = [
    lexAndTok('\\', 'escapedChar', 3, 2),
    warning('\\E', 3),
    invalid(2),
  ];
  testParser('\\ab\\', 3, 3, 1, args2);

  const args3 = [
    lexeme('[', '[', 0, 0),
    lexeme('a', 'bracketChar', 1, 1),
    lexeme(']', ']', 2, 2),
    token('[a]', 'bracketClass', 0, 0, ['a'], ['x']),
    bracket(0, 2, false),
  ];
  testParser('[a]', 3, 1, 0, args3);

  const args4 = [
    lexeme('[', '[', 2, 1),
    lexeme('b', 'bracketChar', 3, 2),
    lexeme(']', ']', 4, 3),
    token('[b]', 'bracketClass', 2, 1, ['b'], ['a']),
    lexAndTok('c', 'charLiteral', 5, 4),
    bracket(1, 3, false),
  ];
  testParser('\\a[b]c', 5, 3, 0, args4);

  const args5 = [
    lexeme('b', 'bracketRangeLow', 3, 2),
    lexeme('-', '-', 4, 3),
    lexeme('d', 'bracketRangeHigh', 5, 4),
    token('[b-d]', 'bracketClass', 2, 1, ['b', 'c', 'd'], ['a', 'e', 'x']),
    lexAndTok('e', 'charLiteral', 7, 6),
    bracket(1, 5, false),
  ];
  testParser('\\a[b-d]e', 7, 3, 0, args5);

  const args6 = [
    lexeme('^', '^', 3, 2),
    lexeme('b', 'bracketChar', 4, 3),
    token('[^b]', 'bracketClass', 2, 1, ['a'], ['b']),
    lexAndTok('c', 'charLiteral', 6, 5),
    bracket(1, 4, true),
  ];
  testParser('\\a[^b]c', 6, 3, 0, args6);

  const args7 = [
    lexeme(']', 'bracketChar', 3, 2),
    lexeme('b', 'bracketChar', 4, 3),
    token('[]b]', 'bracketClass', 2, 1, [']', 'b'], ['x']),
    lexAndTok('c', 'charLiteral', 6, 5),
    bracket(1, 4, false),
  ];
  testParser('\\a[]b]c', 6, 3, 0, args7);

  const args8 = [
    lexeme('^', '^', 3, 2),
    lexeme(']', 'bracketChar', 4, 3),
    lexeme('b', 'bracketChar', 5, 4),
    token('[^]b]', 'bracketClass', 2, 1, ['x'], [']', 'b']),
    lexAndTok('c', 'charLiteral', 7, 6),
    bracket(1, 5, true),
  ];
  testParser('\\a[^]b]c', 7, 3, 0, args8);

  const args9 = [
    lexeme('-', 'bracketChar', 3, 2),
    lexeme('b', 'bracketChar', 4, 3),
    token('[-b]', 'bracketClass', 2, 1, ['-', 'b'], ['x']),
    lexAndTok('c', 'charLiteral', 6, 5),
    bracket(1, 4, false),
  ];
  testParser('\\a[-b]c', 6, 3, 0, args9);

  const args10 = [
    lexeme('^', '^', 3, 2),
    lexeme('-', 'bracketChar', 4, 3),
    lexeme('b', 'bracketChar', 5, 4),
    token('[^-b]', 'bracketClass', 2, 1, ['x'], ['-', 'b']),
    lexAndTok('c', 'charLiteral', 7, 6),
    bracket(1, 5, true),
  ];
  testParser('\\a[^-b]c', 7, 3, 0, args10);

  const args11 = [
    lexeme('b', 'bracketChar', 3, 2),
    lexeme('-', 'bracketChar', 4, 3),
    token('[b-]', 'bracketClass', 2, 1, ['-', 'b'], ['x']),
    lexAndTok('c', 'charLiteral', 6, 5),
    bracket(1, 4, false),
  ];
  testParser('\\a[b-]c', 6, 3, 0, args11);

  const args12 = [
    lexeme('^', '^', 3, 2),
    lexeme('b', 'bracketChar', 4, 3),
    lexeme('-', 'bracketChar', 5, 4),
    token('[^b-]', 'bracketClass', 2, 1, ['x'], ['-', 'b']),
    lexAndTok('c', 'charLiteral', 7, 6),
    bracket(1, 5, true),
  ];
  testParser('\\a[^b-]c', 7, 3, 0, args12);

  const args13 = [
    lexeme('-', 'bracketChar', 3, 2),
    token('[-]', 'bracketClass', 2, 1, ['-'], ['x']),
    lexAndTok('c', 'charLiteral', 5, 4),
    bracket(1, 3, false),
  ];
  testParser('\\a[-]c', 5, 3, 0, args13);

  const args14 = [
    lexeme('^', '^', 3, 2),
    lexeme('-', 'bracketChar', 4, 3),
    token('[^-]', 'bracketClass', 2, 1, ['x'], ['-']),
    lexAndTok('c', 'charLiteral', 6, 5),
    bracket(1, 4, true),
  ];
  testParser('\\a[^-]c', 6, 3, 0, args14);

  const args15 = [
    token('[]]', 'bracketClass', 0, 0, [']'], ['x']),
    bracket(0, 1, false),
    warning('[', 0),
  ];
  testParser('[]', 2, 1, 1, args15);

  const args16 = [
    token('[^]]', 'bracketClass', 0, 0, ['x'], [']']),
    bracket(0, 2, true),
    warning('[', 0),
  ];
  testParser('[^]', 3, 1, 1, args16);

  const args17 = [
    token('[b]', 'bracketClass', 2, 1, ['b'], ['x']),
    bracket(1, 2, false),
    warning('[', 2),
  ];
  testParser('\\a[b', 3, 2, 1, args17);

  const args18 = [
    token('[b-]', 'bracketClass', 2, 1, ['b', '-'], ['x']),
    bracket(1, 3, false),
    warning('[', 2),
  ];
  testParser('\\a[b-', 4, 2, 1, args18);

  const args19 = [
    token('[b-d]', 'bracketClass', 2, 1, ['b', 'c', 'd'], ['x', 'a', 'e']),
    bracket(1, 4, false),
    warning('[', 2),
  ];
  testParser('\\a[b-d', 5, 2, 1, args19);
});

//------------------------------------------------------------------------------
