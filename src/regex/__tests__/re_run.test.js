//------------------------------------------------------------------------------
// Test the NFA run algorithm
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import compile from '../re_compile';

//------------------------------------------------------------------------------

const labelString = (list) => list.map((elem) => elem.label).join('');

const step = (expState, expMatching, expNext) => ({
  expState,
  expMatching,
  expNext,
});

//------------------------------------------------------------------------------

const testRun = (regexString, testString, initNodes, steps = []) => {
  it(`runs the NFA for ${regexString} with ${testString}`, () => {
    const regex = compile(regexString);

    const { runState, matchingNodes, nextNodesToTest } = regex.init();
    expect(runState).toBe('starting');
    expect(labelString(matchingNodes)).toBe('>');
    expect(labelString(nextNodesToTest)).toBe(initNodes);

    let nextNodes = nextNodesToTest;

    for (let step = 0; step < steps.length; step++) {
      const next = regex.step(nextNodes, testString, step);
      const { expState, expMatching, expNext } = steps[step];

      expect(next.runState).toBe(expState);
      expect(labelString(next.matchingNodes)).toBe(expMatching);
      expect(labelString(next.nextNodesToTest)).toBe(expNext);

      nextNodes = next.nextNodesToTest;
    }
  });
};

//------------------------------------------------------------------------------

describe('Regex engine: NFA run algorithm', () => {
  const args1 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('success', 'c', ''),
  ];
  testRun('abc', 'abc', 'a', args1);

  const args2 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('failure', '', ''),
  ];
  testRun('abc', 'abd', 'a', args2);

  const args3 = [
    step('running', 'aaaaa', 'bbbabab'),
    step('running', 'bbbbb', 'ccccc'),
    step('success', 'c', ''),
  ];
  testRun('abc|(abc)|a?bc|a*bc|a+bc', 'abc', 'aaababa', args3);

  const args4 = [
    step('running', 'aaaaa', 'bbbabab'),
    step('running', 'aa', 'abab'),
    step('running', 'bb', 'cc'),
    step('success', 'c', ''),
  ];
  testRun('abc|(abc)|a?bc|a*bc|a+bc', 'aabc', 'aaababa', args4);

  const args5 = [
    step('running', 'aaaaa', 'bbbabab'),
    step('running', 'aa', 'abab'),
    step('failure', '', ''),
  ];
  testRun('abc|(abc)|a?bc|a*bc|a+bc', 'aax', 'aaababa', args5);
});

describe('Regex engine: NFA run algorithm: Alternation', () => {
  const args10 = [
    step('running', 'aaa', 'bbb'),
    step('running', 'bbb', 'cxc'),
    step('running', 'cc', 'xd'),
    step('success', 'd', ''),
  ];
  testRun('abcx|abx|abcd', 'abcd', 'aaa', args10);

  const args11 = [
    step('running', 'aa', 'bx'),
    step('running', 'b', 'cc'),
    step('running', 'cc', 'xd'),
    step('running', 'd', 'e'),
    step('success', 'e', ''),
  ];
  testRun('(ab|ax)(cx|cd)e', 'abcde', 'aa', args11);

  const args12 = [
    step('running', 'aa', 'bx'),
    step('running', 'b', 'cc'),
    step('running', 'cc', 'xd'),
    step('running', 'd', 'x'),
    step('failure', '', ''),
  ];
  testRun('(ab|ax)(cx|cd)x', 'abcde', 'aa', args12);

  const args13 = [
    step('running', 'aa', 'bb'),
    step('running', 'bb', 'cx'),
    step('success', 'c', ''),
  ];
  testRun('((a(b(c)))|(a(b(x))))', 'abc', 'aa', args13);

  const args14 = [
    step('running', 'aa', 'bb'),
    step('running', 'bb', 'cx'),
    step('running', 'c', 'y'),
    step('failure', '', ''),
  ];
  testRun('((a(b(c)))|(a(b(x))))y', 'abcd', 'aa', args14);
});

describe('Regex engine: NFA run algorithm: 0 to 1 quantifier', () => {
  const args20 = [step('running', 'a', 'bc'), step('success', 'c', '')];
  testRun('ab?c', 'ac', 'a', args20);

  const args21 = [
    step('running', 'a', 'bc'),
    step('running', 'b', 'c'),
    step('success', 'c', ''),
  ];
  testRun('ab?c', 'abc', 'a', args21);

  const args22 = [step('running', 'a', 'bc'), step('failure', '', '')];
  testRun('ab?c', 'axc', 'a', args22);

  const args23 = [step('running', 'a', 'bd'), step('success', 'd', '')];
  testRun('a(bc)?d', 'ad', 'a', args23);

  const args24 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'd'),
    step('success', 'd', ''),
  ];
  testRun('a(bc)?d', 'abcd', 'a', args24);

  const args25 = [step('running', 'a', 'xd'), step('failure', '', '')];
  testRun('a(xc)?d', 'abcd', 'a', args25);

  const args26 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'x'),
    step('failure', '', ''),
  ];
  testRun('a(bx)?d', 'abcd', 'a', args26);
});

describe('Regex engine: NFA run algorithm: 0 to N quantifier', () => {
  const args30 = [step('running', 'a', 'bc'), step('success', 'c', '')];
  testRun('ab*c', 'ac', 'a', args30);

  const args31 = [
    step('running', 'a', 'bc'),
    step('running', 'b', 'bc'),
    step('success', 'c', ''),
  ];
  testRun('ab*c', 'abc', 'a', args31);

  const args32 = [
    step('running', 'a', 'bc'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('success', 'c', ''),
  ];
  testRun('ab*c', 'abbc', 'a', args32);

  const args33 = [
    step('running', 'a', 'bc'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('failure', '', ''),
  ];
  testRun('ab*c', 'abbbx', 'a', args33);

  const args34 = [step('running', 'a', 'bd'), step('success', 'd', '')];
  testRun('a(bc)*d', 'ad', 'a', args34);

  const args35 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('success', 'd', ''),
  ];
  testRun('a(bc)*d', 'abcd', 'a', args35);

  const args36 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('success', 'd', ''),
  ];
  testRun('a(bc)*d', 'abcbcd', 'a', args36);

  const args37 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('failure', '', ''),
  ];
  testRun('a(bc)*d', 'abcx', 'a', args37);

  const args38 = [
    step('running', 'a', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('running', 'b', 'c'),
    step('failure', '', ''),
  ];
  testRun('a(bc)*d', 'abcbx', 'a', args38);
});

describe('Regex engine: NFA run algorithm: 1 to N quantifier', () => {
  const args40 = [step('running', 'a', 'b'), step('failure', '', '')];
  testRun('ab+c', 'ac', 'a', args40);

  const args41 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'bc'),
    step('success', 'c', ''),
  ];
  testRun('ab+c', 'abc', 'a', args41);

  const args42 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('success', 'c', ''),
  ];
  testRun('ab+c', 'abbc', 'a', args42);

  const args43 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('running', 'b', 'bc'),
    step('failure', '', ''),
  ];
  testRun('ab+c', 'abbbx', 'a', args43);

  const args44 = [step('running', 'a', 'b'), step('failure', '', '')];
  testRun('a(bc)+d', 'ad', 'a', args44);

  const args45 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('success', 'd', ''),
  ];
  testRun('a(bc)+d', 'abcd', 'a', args45);

  const args46 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('success', 'd', ''),
  ];
  testRun('a(bc)+d', 'abcbcd', 'a', args46);

  const args47 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('failure', '', ''),
  ];
  testRun('a(bc)+d', 'abcx', 'a', args47);

  const args48 = [
    step('running', 'a', 'b'),
    step('running', 'b', 'c'),
    step('running', 'c', 'bd'),
    step('running', 'b', 'c'),
    step('failure', '', ''),
  ];
  testRun('a(bc)+d', 'abcbx', 'a', args48);
});
