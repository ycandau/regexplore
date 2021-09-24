//------------------------------------------------------------------------------
// Application state
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { useReducer, useCallback } from 'react';
import compile from '../regex/re_compile';

//------------------------------------------------------------------------------
// Constants

const MAX_LOGS = 8;

const REGEX = 'setRegex';
const TEST_STR = 'testString';
const FORWARD = 'stepForward';
const BACKWARD = 'stepBackward';
const BEGINNING = 'backToBeginning';
const PLAY = 'play';

//------------------------------------------------------------------------------
// Initial state

const initRegex = compile('');

const initHistory = {
  histIndex: 0,
  histEnd: -1,
  histStates: [
    {
      runState: 'running',
      matchingNodes: [],
      nextNodesToTest: [],
      testRange: [0, 0],
      matchRanges: [],
    },
  ],
};

const initLogs = {
  firstLogIndex: 0,
  logs: [],
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
    ...initHistory,
    ...initLogs,
    ...initPlay,
    regex,
  };
};

const setTestString = (state, action) => {
  const testString = action.testString || '';

  return {
    ...state,
    ...initHistory,
    ...initLogs,
    ...initPlay,
    testString,
  };
};

const newHistState = (histState) => {
  const {
    runState,
    matchingNodes,
    nextNodesToTest,
    testRange,
    matchRanges,
  } = histState;

  return {
    runState,
    matchingNodes,
    nextNodesToTest,
    testRange,
    matchRanges,
  };
};

const getLogMessage = (histState, char, match) => {
  switch (histState.runState) {
    case 'running':
      const count = histState.matchingNodes.length;
      return `Matching: ${char} - Nodes: ${count}`;
    case 'success':
      return `Match: ${match}`;
    case 'failure':
      return 'No match';
    case 'end':
      return 'End of test string';
    default:
      break;
  }
};

const newLog = (begin, pos, key, histState) => {
  const prompt = `[${begin}:${pos}]`;
  let msg = getLogMessage(histState);
  return { prompt, msg, key };
};

const stepForward = (state) => {
  const { histIndex, histEnd, histStates, logs } = state;
  const histState = histStates[histIndex];
  const [begin, pos] = histState.testRange;

  const nextHistState = newHistState(histState);
  const nextLog = newLog(begin, pos + 1, histEnd + 1, histState);
  const firstLogIndex = Math.max(histIndex - MAX_LOGS + 1, 0);

  return {
    ...state,
    ...initPlay,
    histIndex: histIndex + 1,
    histEnd: histEnd + 1,
    histStates: [...histStates, nextHistState],
    firstLogIndex,
    logs: [...logs, nextLog],
  };
};

const stepForwardRetrace = (state) => {
  const { histIndex } = state;
  const firstLogIndex = Math.max(histIndex - MAX_LOGS + 1, 0);
  return {
    ...state,
    ...initPlay,
    histIndex: histIndex + 1,
    firstLogIndex,
  };
};

const stepBackward = (state) => {
  const { histIndex } = state;
  const firstLogIndex = Math.max(
    Math.min(histIndex - 2, state.firstLogIndex),
    0
  );
  return {
    ...state,
    ...initPlay,
    histIndex: histIndex - 1,
    firstLogIndex,
  };
};

const backToBeginning = (state) => {
  return {
    ...state,
    ...initPlay,
    histIndex: 0,
    firstLogIndex: 0,
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
  const [begin, pos] = histState.testRange;

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
  const [state, dispatch] = useReducer({
    regex: initRegex,
    ...initHistory,
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
