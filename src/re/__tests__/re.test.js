import { compile, generateRegexFromRPN } from '../re_parser';

//------------------------------------------------------------------------------

const rpnStr = (parser) => parser.rpn.map((token) => token.label).join('');

const descriptionsStr = (parser) =>
  parser.lexemes.map((descrip) => descrip.label).join('');

const token = (rpnIndex, pos, index, label, type) => ({
  rpnIndex,
  pos,
  index,
  label,
  type,
});

const runParser = (input, rpn, ...tokens) => {
  it(`runs the input /${input}/`, () => {
    const parser = compile(input);

    expect(rpnStr(parser)).toBe(rpn);
    expect(descriptionsStr(parser)).toBe(input);
    expect(generateRegexFromRPN(parser.rpn)).toBe(input);

    tokens.forEach(({ rpnIndex, pos, index, label, type }) => {
      const token = parser.rpn[rpnIndex];
      expect(token.pos).toBe(pos);
      expect(token.index).toBe(index);
      expect(token.label).toBe(label);
      expect(token.type).toBe(type);
    });
  });
};

const runBracketClass = (input) => {
  it(`runs the bracket class /${input}/`, () => {
    const parser = compile(input);
    const token = parser.rpn[0];

    expect(token.label).toBe(input);
    expect(token.type).toBe('bracketClass');
    expect(token.begin).toBe(0);
    expect(token.end).toBe(input.length - 1);
    expect(token.negate).toBe(input[1] === '^');
    expect(parser.rpn.length).toBe(1);
  });
};

const runEdgeCase = (input, rpn, fixed, count, types = [], positions = []) => {
  it(`runs the input /${input}/ and raises a warning`, () => {
    const parser = compile(input);

    expect(rpnStr(parser)).toBe(rpn);
    expect(descriptionsStr(parser)).toBe(input);
    expect(parser.warnings.length).toBe(count);
    expect(generateRegexFromRPN(parser.rpn)).toBe(fixed);

    types.forEach((type, index) => {
      const pos = positions[index];
      const warnings = parser.warnings.filter((w) => w.pos === pos);
      const warning = warnings[0];
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
  runBracketClass('[abc]');
  runBracketClass('[a-d]');

  runBracketClass('[]abc]');
  runBracketClass('[-abc]');
  runBracketClass('[abc-]');

  runBracketClass('[^]abc]');
  runBracketClass('[^-abc]');
  runBracketClass('[^abc-]');
});

//------------------------------------------------------------------------------

describe('RE parser: Edge cases', () => {
  runEdgeCase('', '', '', 0);

  runEdgeCase('ab[cd', 'ab~[cd]~', 'ab[cd]', 1, ['['], [2]);
  runEdgeCase('ab(cd', 'ab~cd~(~', 'ab(cd)', 1, ['('], [2]);
  runEdgeCase('a(b(c', 'abc(~(~', 'a(b(c))', 2, ['(', '('], [3, 1]);
  runEdgeCase('a(b[c', 'ab[c]~(~', 'a(b[c])', 2, ['[', '('], [3, 1]);
  runEdgeCase('ab)cd', 'ab~c~d~', 'abcd', 1, [')'], [2]);
  runEdgeCase('a)b)c)d', 'ab~c~d~', 'abcd', 3, [')', ')', ')'], [1, 3, 5]);
  runEdgeCase(')ab', 'ab~', 'ab', 1, [')'], [0]);
  runEdgeCase('a(b))c', 'ab(~c~', 'a(b)c', 1);

  runEdgeCase('*ab', 'ab~', 'ab', 1, ['E*'], [0]);
  runEdgeCase('a|+b', 'ab|', 'a|b', 1, ['E*'], [2]);
  runEdgeCase('a(?b)', 'ab(~', 'a(b)', 1, ['E*'], [2]);
  runEdgeCase('*ab', 'ab~', 'ab', 1, ['E*'], [0]);
  runEdgeCase('*)ab', 'ab~', 'ab', 2, [')', 'E*'], [1, 0]);

  runEdgeCase('ab??', 'ab?~', 'ab?', 1, ['**'], [3]);
  runEdgeCase('ab**', 'ab*~', 'ab*', 1, ['**'], [3]);
  runEdgeCase('ab++', 'ab+~', 'ab+', 1, ['**'], [3]);
  runEdgeCase('ab??+', 'ab*~', 'ab*', 2, ['**', '**'], [3, 4]);
  runEdgeCase('ab++?', 'ab*~', 'ab*', 2, ['**', '**'], [3, 4]);

  runEdgeCase('|a', 'a', 'a', 1);
  runEdgeCase('||a', 'a', 'a', 2);
  runEdgeCase('a(|b)', 'ab(~', 'a(b)', 1);
  runEdgeCase('a(b|)', 'ab(~', 'a(b)', 1);
  runEdgeCase('a(||b)', 'ab(~', 'a(b)', 2);
  runEdgeCase('a(b||)', 'ab(~', 'a(b)', 2);
  runEdgeCase('(|||a)||b||c', 'a(b|c|', '(a)|b|c', 5);
  runEdgeCase('ab|', 'ab~', 'ab', 1);
  runEdgeCase('ab||', 'ab~', 'ab', 2);
  runEdgeCase('ab||*||', 'ab~', 'ab', 5);

  runEdgeCase('()', '', '', 1);
  runEdgeCase('a()b', 'ab~', 'ab', 1);
  runEdgeCase('a(())b', 'ab~', 'ab', 2);
  runEdgeCase('a(()b)c', 'ab(~c~', 'a(b)c', 1);
  runEdgeCase('a(b())c', 'ab(~c~', 'a(b)c', 1);

  runEdgeCase('a(', 'a', 'a', 1);
  runEdgeCase('a((', 'a', 'a', 2);
  runEdgeCase('a(*', 'a', 'a', 2);
  runEdgeCase('a((*)(|))', 'a', 'a', 5);
});

//------------------------------------------------------------------------------
