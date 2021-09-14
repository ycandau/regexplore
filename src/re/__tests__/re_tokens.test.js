import { tokenize } from '../re_tokens';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const token = (label, type, pos, index, passes = [], fails = []) => ({
  label,
  type,
  pos,
  index,
  passes,
  fails,
});

//------------------------------------------------------------------------------

const testLexer = (regex, length, ...list) => {
  it(`lexes the regex /${regex}/`, () => {
    const { lexemes } = tokenize(regex);

    expect(lexemes.length).toBe(length);
    expect(labelString(lexemes)).toBe(regex);

    list.forEach(({ label, type, pos, index }) => {
      const lexeme = lexemes[index];
      expect(lexeme.label).toBe(label);
      expect(lexeme.type).toBe(type);
      expect(lexeme.pos).toBe(pos);
    });
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Lexer', () => {
  const tokens = [
    token('a', 'charLiteral', 0, 0, ['a'], ['x']),
    token('b', 'charLiteral', 1, 1),
    token('c', 'charLiteral', 2, 2),
  ];
  testLexer('abc', 3, ...tokens);
  testLexer('a.c', 3, token('.', '.', 1, 1, ['a']));
  testLexer('\\d\\d', 2, token('\\d', 'charClass', 2, 1, ['0'], ['a']));
  testLexer('\\+\\+', 2, token('\\+', 'escapedChar', 2, 1, ['+'], ['a']));

  testLexer('\\a|b', 3, token('|', '|', 2, 1));
  testLexer('\\ab*', 3, token('*', '*', 3, 2));

  testLexer('\\a[b]c', 5, token('[', '[', 2, 1));
  testLexer('\\a[b]c', 5, token('c', 'charLiteral', 5, 4));

  testLexer('\\a[b-d]e', 7, token('b', 'bracketRangeLow', 3, 2));
  testLexer('\\a[b-d]e', 7, token('-', '-', 4, 3));
  testLexer('\\a[b-d]e', 7, token('d', 'bracketRangeHigh', 5, 4));

  testLexer('\\a[^b]c', 6, token('^', '^', 3, 2));
  testLexer('\\a[]b]c', 6, token(']', 'bracketChar', 3, 2));
  testLexer('\\a[^]b]c', 7, token(']', 'bracketChar', 4, 3));
  testLexer('\\a[-b]c', 6, token('-', 'bracketChar', 3, 2));
  testLexer('\\a[^-b]c', 7, token('-', 'bracketChar', 4, 3));
  testLexer('\\a[b-]c', 6, token('-', 'bracketChar', 4, 3));
  testLexer('\\a[^b-]c', 7, token('-', 'bracketChar', 5, 4));
});

//------------------------------------------------------------------------------

const testParser = (regex, length, ...list) => {
  it(`parses the regex /${regex}/`, () => {
    const { lexemes, tokens } = tokenize(regex);

    expect(tokens.length).toBe(length);
    expect(labelString(tokens)).toBe(regex);

    list.forEach(({ label, type, pos, index, passes, fails }) => {
      const lexeme = lexemes[index];

      const token = tokens.filter((tok) => tok.index === index)[0];
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
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: Parser', () => {
  const tokens = [
    token('a', 'charLiteral', 0, 0, ['a'], ['x']),
    token('b', 'charLiteral', 1, 1),
    token('c', 'charLiteral', 2, 2),
  ];
  testParser('abc', 3, ...tokens);
  testParser('a.c', 3, token('.', '.', 1, 1, ['a']));
  testParser('\\d\\d', 2, token('\\d', 'charClass', 2, 1, ['0'], ['a']));
  testParser('\\+\\+', 2, token('\\+', 'escapedChar', 2, 1, ['+'], ['a']));

  testParser('a|b', 3, token('|', '|', 1, 1));
  testParser('ab*', 3, token('*', '*', 2, 2));

  testParser('a[b]c', 3, token('[b]', 'bracketClass', 1, 1));
  testParser('a[b]c', 3, token('c', 'charLiteral', 4, 4));
});
