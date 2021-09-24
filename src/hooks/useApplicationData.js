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
  logFirst: 0,
  firstLogIndex: [],
};

//------------------------------------------------------------------------------
// Reducer helpers

const setRegex = (state, action) => {
  const regexString = action.regexString || '';
  const regex = compile(regexString);

  return {
    ...state,
    regex,
    ...initHistory,
    ...initLogs,
  };
};

const setTestString = (state, action) => {
  const testString = action.testString || '';

  return {
    ...state,
    testString,
    ...initHistory,
    ...initLogs,
  };
};

const stepForward = (state) => {
  return state;
};

const stepForwardRetrace = (state) => {
  const { histIndex } = state;
  const firstLogIndex = Math.max(histIndex - MAX_LOGS + 1, 0);
  return {
    ...state,
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
    histIndex: histIndex - 1,
    firstLogIndex,
  };
};

const backToBeginning = (state) => {
  return {
    ...state,
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
    play: false,
    count: 0,
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
