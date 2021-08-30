import Parser from '../re_parser';

//------------------------------------------------------------------------------

const rpnStr = (parser) => parser.rpn.map((token) => token.label).join('');

const descriptionsStr = (parser) =>
  parser.descriptions.map((descrip) => descrip.label).join('');

const token = (pos, index, label, type) => ({ pos, index, label, type });

const runParser = (input, rpn, ...tokens) => {
  it(`runs the input /${input}/`, () => {
    const parser = new Parser(input);
    parser.generateRPN();

    expect(rpnStr(parser)).toBe(rpn);
    expect(descriptionsStr(parser)).toBe(input);
    expect(parser.operators.length).toBe(0);

    tokens.forEach((data) => {
      const token = parser.rpn[data.index];
      expect(token.pos).toBe(data.pos);
      expect(token.label).toBe(data.label);
      expect(token.type).toBe(data.type);
    });
  });
};

const runBracketClass = (input, matches) => {
  it(`runs the bracket class /${input}/`, () => {
    const parser = new Parser(input);
    parser.generateRPN();
    const token = parser.rpn[0];

    expect(token.label).toBe(input);
    expect(token.type).toBe('bracketClass');
    expect(token.range[0]).toBe(0);
    expect(token.range[1]).toBe(input.length - 1);
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
    parser.generateRPN();

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

describe('RE parser', () => {
  runParser('abcd', 'ab~c~d~', token(0, 0, 'a', 'charLiteral'));
  runParser('.a..b.', '.a~.~.~b~.~', token(0, 0, '.', '.'));
  runParser('\\da\\d\\d', '\\da~\\d~\\d~', token(0, 0, '\\d', 'charClass'));

  runParser(
    '\\+a\\+b\\+',
    '\\+a~\\+~b~\\+~',
    token(0, 0, '\\+', 'escapedChar')
  );

  runParser(
    '[a]b[c][d]',
    '[a]b~[c]~[d]~',
    token(undefined, 0, '[a]', 'bracketClass')
  );

  runParser('ab|cd', 'ab~cd~|', token(2, 6, '|', '|'));
  runParser('ab?|c?d|e?|f', 'ab?~c?d~|e?|f|', token(2, 2, '?', '?'));
  runParser('ab*|c*d|e*|f', 'ab*~c*d~|e*|f|', token(2, 2, '*', '*'));
  runParser('ab+|c+d|e+|f', 'ab+~c+d~|e+|f|', token(2, 2, '+', '+'));

  runParser('(a)', 'a(', token(0, 1, '(', '('));
  runParser('(a|b)|(c|d)', 'ab|(cd|(|', token(6, 7, '(', '('));
  runParser('(ab)*', 'ab~(*', token(0, 3, '(', '('));
  runParser('a(b(c|d))', 'abcd|(~(~', token(3, 5, '(', '('));

  runBracketClass('[abc]', 'abc');
  runBracketClass('[a-d]', 'abcd');

  runBracketClass('[]abc]', ']abc');
  runBracketClass('[-abc]', '-abc');
  runBracketClass('[abc-]', 'abc-');

  runBracketClass('[^]abc]', ']abc');
  runBracketClass('[^-abc]', '-abc');
  runBracketClass('[^abc-]', 'abc-');

  runEdgeCase('ab[cd', 'ab~[cd~', 'ab[cd]', ['!]'], [2]);
  runEdgeCase('ab(cd', 'ab~cd~(~', 'ab(cd)', ['!)'], [2]);
  runEdgeCase('a(b(c', 'abc(~(~', 'a(b(c))', ['!)', '!)'], [3, 1]);
  runEdgeCase('a(b[c', 'ab[c~(~', 'a(b[c])', ['!]', '!)'], [3, 1]);
  runEdgeCase('ab)cd', 'ab~c~d~', 'abcd', ['!('], [2]);
});

//------------------------------------------------------------------------------
