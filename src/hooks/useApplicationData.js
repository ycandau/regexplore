//------------------------------------------------------------------------------
// Application state
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { useReducer, useCallback } from 'react';

import compile from '../regex/re_compile';

//------------------------------------------------------------------------------
// Constants

const REGEX = 'setRegex';
const TEST_STR = 'testString';
const FORWARD = 'stepForward';
const BACKWARD = 'stepBackward';
const BEGINNING = 'backToBeginning';
const PLAY = 'play';

//------------------------------------------------------------------------------
// Initial state

const initRegex = compile('abc');

const initHistory = (regex) => ({
  histIndex: 0,
  histEnd: 0,
  histStates: [
    {
      ...regex.init(),
      testRange: [0, 0],
      nextTestRange: [0, 0],
      matchRanges: [],
    },
  ],
});

const initLogs = {
  logsTopIndex: 0,
  logsDisplayCount: 5,
  logs: [{ prompt: '[0:0]', msg: 'New search', key: 'begin' }],
};

const initPlay = {
  play: false,
  count: 0,
};

//------------------------------------------------------------------------------
// Reducer helpers

const setRegex = (state, action) => {
  const regexString = action.regexString || '';
  const regex = compile(regexString);

  return {
    ...state,
    ...initHistory(regex),
    ...initLogs,
    ...initPlay,
    regex,
  };
};

//------------------------------------------------------------------------------

const setTestString = (state, action) => {
  const testString = action.testString || '';

  return {
    ...state,
    ...initHistory(state.regex),
    ...initLogs,
    ...initPlay,
    testString,
  };
};

//------------------------------------------------------------------------------

const stepForward = (state) => {
  const { regex, testString, histIndex, histEnd, histStates, logs } = state;
  const histState = histStates[histIndex];
  const [begin, end] = histState.nextTestRange;

  const nextHistState =
    histState.runState === 'starting' || histState.runState === 'running'
      ? regex.step(histState.nextNodesToTest, testString, end)
      : regex.init();

  nextHistState.testRange = histState.nextTestRange;
  nextHistState.matchRanges = histState.matchRanges;

  let msg = null;

  switch (nextHistState.runState) {
    case 'starting':
      nextHistState.nextTestRange = [begin, end];
      msg = 'New search';
      break;

    case 'success':
      nextHistState.nextTestRange = [end + 1, end + 1];
      nextHistState.matchRanges = [...histState.matchRanges, [begin, end]];
      msg = `Match: ${testString.slice(begin, end + 1)}`;
      break;

    case 'failure':
      nextHistState.nextTestRange = [begin + 1, begin + 1];
      msg = 'No match';
      break;

    case 'endOfString':
      nextHistState.nextTestRange = [begin + 1, begin + 1];
      msg = 'End of test string';
      break;

    case 'running':
      nextHistState.nextTestRange = [begin, end + 1];
      const ch = testString[end] === ' ' ? "' '" : testString[end];
      msg = `Char: ${ch} - Nodes: ${nextHistState.matchingNodes.length}`;
      break;

    default:
      break;
  }

  // Logs
  const prompt = `[${begin}:${end}]`;
  const key = `${logs.length}`;
  const log = { prompt, key, msg };
  const logsTopIndex = Math.max(histIndex - state.logsDisplayCount + 2, 0);

  // Finalize
  return {
    ...state,
    ...initPlay,
    histIndex: histIndex + 1,
    histEnd: histEnd + 1,
    histStates: [...histStates, nextHistState],
    logsTopIndex,
    logs: [...logs, log],
  };
};

//------------------------------------------------------------------------------

const stepForwardRetrace = (state) => {
  const histIndex = state.histIndex + 1;
  const logsTopIndex = Math.max(
    histIndex - state.logsDisplayCount + 1,
    state.logsTopIndex
  );

  return {
    ...state,
    ...initPlay,
    histIndex,
    logsTopIndex,
  };
};

//------------------------------------------------------------------------------

const stepBackward = (state) => {
  const histIndex = state.histIndex - 1;
  const logsTopIndex = Math.min(histIndex, state.logsTopIndex);

  return {
    ...state,
    ...initPlay,
    histIndex,
    logsTopIndex,
  };
};

const backToBeginning = (state) => {
  return {
    ...state,
    ...initPlay,
    histIndex: 0,
    logsTopIndex: 0,
  };
};

const play = (state) => {
  return {
    ...state,
    play: !state.play,
  };
};

//------------------------------------------------------------------------------
// Reducer

const appStateReducer = (state, action) => {
  const { histIndex, histStates, testString } = state;
  const histState = histStates[histIndex];
  const pos = histState.nextTestRange[1];

  switch (action.type) {
    case REGEX:
      return setRegex(state, action);

    case TEST_STR:
      return setTestString(state, action);

    case FORWARD:
      if (pos === testString.length) return state;
      if (histIndex < histStates.length - 1) return stepForwardRetrace(state);
      return stepForward(state);

    case BACKWARD:
      if (histIndex === 0) return state;
      return stepBackward(state);

    case BEGINNING:
      return backToBeginning(state);

    case PLAY:
      return play(state);

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

//------------------------------------------------------------------------------
// Hook

const useApplicationData = () => {
  const [state, dispatch] = useReducer(appStateReducer, {
    regex: initRegex,
    testString: 'abc d abx',
    ...initHistory(initRegex),
    ...initLogs,
    ...initPlay,
  });

  const setRegex = useCallback(
    (regexString) => dispatch({ type: REGEX, regexString }),
    []
  );

  const setTestString = useCallback(
    (testString) => dispatch({ type: TEST_STR, testString }),
    []
  );

  const stepForward = useCallback(() => dispatch({ type: FORWARD }), []);
  const stepBackward = useCallback(() => dispatch({ type: BACKWARD }), []);
  const toBeginning = useCallback(() => dispatch({ type: BEGINNING }), []);
  const play = useCallback(() => dispatch({ type: PLAY }), []);

  return [
    state,
    { setRegex, setTestString, stepForward, stepBackward, toBeginning, play },
  ];
};

//------------------------------------------------------------------------------

export default useApplicationData;
