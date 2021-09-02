import Parser from '../re_parser';

//------------------------------------------------------------------------------

const rpnStr = (parser) => parser.rpn.map((token) => token.label).join('');

const descriptionsStr = (parser) =>
  parser.descriptions.map((descrip) => descrip.label).join('');

const token = (rpnIndex, pos, index, label, type) => ({
  rpnIndex,
  pos,
  index,
  label,
  type,
});

const runParser = (input, rpn, ...tokens) => {
  it(`runs the input /${input}/`, () => {
    const parser = new Parser(input);
    parser.parse();

    expect(rpnStr(parser)).toBe(rpn);
    expect(descriptionsStr(parser)).toBe(input);
    expect(parser.operators.length).toBe(0);
    expect(parser.fix()).toBe(input);

    tokens.forEach(({ rpnIndex, pos, index, label, type }) => {
      const token = parser.rpn[rpnIndex];
      expect(token.pos).toBe(pos);
      expect(token.index).toBe(index);
      expect(token.label).toBe(label);
      expect(token.type).toBe(type);
    });
  });
};

const runBracketClass = (input, matches) => {
  it(`runs the bracket class /${input}/`, () => {
    const parser = new Parser(input);
    parser.parse();
    const token = parser.rpn[0];

    expect(token.label).toBe(input);
    expect(token.type).toBe('bracketClass');
    expect(token.begin).toBe(0);
    expect(token.end).toBe(input.length - 1);
    expect(token.negate).toBe(input[1] === '^');
    expect(token.matches).toBe(matches);

    matches.split('').forEach((ch) => {
      expect(token.match(ch)).toBe(!token.negate);
    });
    expect(token.match('X')).toBe(token.negate);

    expect(parser.rpn.length).toBe(1);
    expect(parser.operators.length).toBe(0);
  });
};

const runEdgeCase = (input, rpn, fixed, types, positions) => {
  it(`runs the input /${input}/ and raises a warning`, () => {
    const parser = new Parser(input);
    parser.parse();

    expect(rpnStr(parser)).toBe(rpn);
    expect(descriptionsStr(parser)).toBe(input);
    expect(parser.operators.length).toBe(0);
    expect(parser.warnings.length).toBe(types.length);
    expect(parser.fix()).toBe(fixed);

    parser.warnings.forEach((warning, index) => {
      expect(warning.type).toBe(types[index]);
      expect(warning.pos).toBe(positions[index]);
    });
  });
};

//------------------------------------------------------------------------------

describe('RE parser: General tests', () => {
  runParser('abcd', 'ab~c~d~', token(0, 0, 0, 'a', 'charLiteral'));
  runParser('.a..b.', '.a~.~.~b~.~', token(0, 0, 0, '.', '.'));
  runParser('\\da\\d\\d', '\\da~\\d~\\d~', token(3, 3, 2, '\\d', 'charClass'));

  runParser(
    '\\+a\\+b\\+',
    '\\+a~\\+~b~\\+~',
    token(3, 3, 2, '\\+', 'escapedChar')
  );

  runParser(
    '[a]\\w[c][d]',
    '[a]\\w~[c]~[d]~',
    token(3, 5, 4, '[c]', 'bracketClass')
  );

  runParser('a\\b|cd', 'a\\b~cd~|', token(6, 3, 2, '|', '|'));
  runParser('a\\b?|c?d|e?|f', 'a\\b?~c?d~|e?|f|', token(2, 3, 2, '?', '?'));
  runParser('a\\b*|c*d|e*|f', 'a\\b*~c*d~|e*|f|', token(2, 3, 2, '*', '*'));
  runParser('a\\b+|c+d|e+|f', 'a\\b+~c+d~|e+|f|', token(2, 3, 2, '+', '+'));

  runParser('\\a(a)', '\\aa(~', token(2, 2, 1, '(', '('));
  runParser('(a|b)|(c|d)', 'ab|(cd|(|', token(7, 6, 6, '(', '('));
  runParser('(ab)*', 'ab~(*', token(3, 0, 0, '(', '('));
  runParser('a(b(c|d))', 'abcd|(~(~', token(5, 3, 3, '(', '('));
});

//------------------------------------------------------------------------------

describe('RE parser: Bracket expressions', () => {
  runBracketClass('[abc]', 'abc');
  runBracketClass('[a-d]', 'abcd');

  runBracketClass('[]abc]', ']abc');
  runBracketClass('[-abc]', '-abc');
  runBracketClass('[abc-]', 'abc-');

  runBracketClass('[^]abc]', ']abc');
  runBracketClass('[^-abc]', '-abc');
  runBracketClass('[^abc-]', 'abc-');
});

//------------------------------------------------------------------------------

describe('RE parser: Edge cases', () => {
  runEdgeCase('ab[cd', 'ab~[cd]~', 'ab[cd]', ['!['], [2]);
  runEdgeCase('ab(cd', 'ab~cd~(~', 'ab(cd)', ['!('], [2]);
  runEdgeCase('a(b(c', 'abc(~(~', 'a(b(c))', ['!(', '!('], [3, 1]);
  runEdgeCase('a(b[c', 'ab[c]~(~', 'a(b[c])', ['![', '!('], [3, 1]);
  runEdgeCase('ab)cd', 'ab~c~d~', 'abcd', ['!)'], [2]);
  runEdgeCase('a)b)c)d', 'ab~c~d~', 'abcd', ['!)', '!)', '!)'], [1, 3, 5]);
  runEdgeCase('*ab', 'ab~', 'ab', ['!E'], [0]);
  runEdgeCase('a|+b', 'ab|', 'a|b', ['!E'], [2]);
  runEdgeCase('a(?b)', 'ab(~', 'a(b)', ['!E'], [2]);
  runEdgeCase('ab??', 'ab?~', 'ab?', ['!**'], [3]);
  runEdgeCase('ab**', 'ab*~', 'ab*', ['!**'], [3]);
  runEdgeCase('ab++', 'ab+~', 'ab+', ['!**'], [3]);
  runEdgeCase('ab??+', 'ab*~', 'ab*', ['!**', '!**'], [3, 4]);
  runEdgeCase('ab++?', 'ab*~', 'ab*', ['!**', '!**'], [3, 4]);

  // runEdgeCase('a(|b)', 'a0b|(~', 'a(|b)', [], []);
  // runEdgeCase('a(b|)', 'ab0|(~', 'a(b|)', [], []);
  // runEdgeCase('|a', '0a|', '|a', [], []);

  // runEdgeCase('a()b', 'a0(~b~', 'a()b', [], []);
  runEdgeCase(')ab', 'ab~', 'ab', ['!)'], [0]);
  runEdgeCase('*ab', 'ab~', 'ab', ['!E'], [0]);
  runEdgeCase('*)ab', 'ab~', 'ab', ['!E', '!)'], [0, 1]);

  runEdgeCase('ab|', 'ab~', 'ab', [], []);
  runEdgeCase('ab(', 'ab~', 'ab', [], []);

  // runEdgeCase('ab((', 'ab~', 'ab', [], []);
  // runEdgeCase('ab(*', 'ab~', 'ab', [], []);
  // runEdgeCase('ab|*', 'ab~', 'ab', [], []);
});

//------------------------------------------------------------------------------
