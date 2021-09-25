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
      const next = regex.step(nextNodes, testString[step]);
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
    step('running', 'aaa', 'bbb'),
    step('running', 'bbb', 'cxc'),
    step('running', 'cc', 'xd'),
    step('success', 'd', ''),
  ];
  testRun('abcx|abx|abcd', 'abcd', 'aaa', args3);

  const args4 = [
    step('running', 'aa', 'bx'),
    step('running', 'b', 'cc'),
    step('running', 'cc', 'xd'),
    step('running', 'd', 'e'),
    step('success', 'e', ''),
  ];
  testRun('(ab|ax)(cx|cd)e', 'abcde', 'aa', args4);

  const args5 = [
    step('running', 'aa', 'bx'),
    step('running', 'b', 'cc'),
    step('running', 'cc', 'xd'),
    step('running', 'd', 'x'),
    step('failure', '', ''),
  ];
  testRun('(ab|ax)(cx|cd)x', 'abcde', 'aa', args5);
});
