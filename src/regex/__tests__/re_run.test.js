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
});
