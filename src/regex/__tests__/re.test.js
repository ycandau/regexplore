import parse from '../re_parse';
import validate from '../re_validate';
import convertToRPN from '../re_rpn';
import generateRegexFromRPN from '../re_autofix';

//------------------------------------------------------------------------------

const rpnStr = (rpn) => rpn.map((token) => token.label).join('');

const descriptionsStr = (lexemes) =>
  lexemes.map((descrip) => descrip.label).join('');

const token = (rpnIndex, pos, index, label, type) => ({
  rpnIndex,
  pos,
  index,
  label,
  type,
});

const runParser = (input, rpnExpected, ...args) => {
  it(`runs the input /${input}/`, () => {
    const { lexemes, tokens, warnings } = parse(input);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);
    const autofix = generateRegexFromRPN(rpn);

    expect(rpnStr(rpn)).toBe(rpnExpected);
    expect(descriptionsStr(lexemes)).toBe(input);
    expect(autofix()).toBe(input);

    args.forEach(({ rpnIndex, pos, index, label, type }) => {
      const token = rpn[rpnIndex];
      expect(token.pos).toBe(pos);
      expect(token.index).toBe(index);
      expect(token.label).toBe(label);
      expect(token.type).toBe(type);
    });
  });
};

const runBracketClass = (input) => {
  it(`runs the bracket class /${input}/`, () => {
    const { lexemes, tokens, warnings } = parse(input);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);
    const token = rpn[0];

    expect(token.label).toBe(input);
    expect(token.type).toBe('bracketClass');
    expect(token.begin).toBe(0);
    expect(token.end).toBe(input.length - 1);
    expect(token.negate).toBe(input[1] === '^');
    expect(rpn.length).toBe(1);
  });
};

const runEdgeCase = (
  input,
  rpnExpected,
  fixed,
  warnLength,
  types = [],
  positions = []
) => {
  it(`runs the input /${input}/ and raises a warning`, () => {
    const { lexemes, tokens, warnings } = parse(input);
    const validTokens = validate(tokens, lexemes, warnings);
    const rpn = convertToRPN(validTokens, lexemes);
    const autofix = generateRegexFromRPN(rpn);

    expect(rpnStr(rpn)).toBe(rpnExpected);
    expect(descriptionsStr(lexemes)).toBe(input);
    expect(autofix()).toBe(fixed);

    const warningsList = [...warnings.values()];
    const count = warningsList.reduce((sum, w) => sum + w.positions.length, 0);
    expect(count).toBe(warnLength);

    types.forEach((type, index) => {
      const pos = positions[index];
      const warning = warnings.get(type);
      expect(warning.positions).toContain(pos);
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
