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

const initRegex = compile('abc');

const initHistory = {
  histIndex: 0,
  histEnd: -1,
  histStates: [
    {
      ...initRegex.init(),
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

const stepForward = (state) => {
  const { histIndex, histEnd, histStates, logs } = state;
  const histState = histStates[histIndex];
  const [begin, end] = histState.testRange;
  const ch = state.testString[end];

  let nextHistState = null;
  let prompt = null;
  let msg = null;

  switch (histState.runState) {
    case 'success':
      nextHistState = state.regex.init(); // starting
      nextHistState.testRange = [end + 1, end + 1];
      nextHistState.matchRanges = histState.matchRanges;

      prompt = `[${end + 1}:${end + 1}]`;
      msg = 'New search';
      break;

    case 'failure':
      nextHistState = state.regex.init(); // starting
      nextHistState.testRange = [begin + 1, begin + 1];
      nextHistState.matchRanges = histState.matchRanges;

      prompt = `[${begin + 1}:${begin + 1}]`;
      msg = 'New search';
      break;

    case 'starting':
    case 'running':
      nextHistState = state.regex.step(histState.nextNodesToTest, ch);

      switch (nextHistState.runState) {
        case 'success':
          nextHistState.testRange = [begin, end];
          nextHistState.matchRanges = [...histState.matchRanges, [begin, end]];

          prompt = `[${begin}:${end}]`;
          msg = `Match: ${state.testString.slice(begin, end + 1)}`;
          break;

        case 'failure':
          nextHistState.testRange = [begin, end];
          nextHistState.matchRanges = histState.matchRanges;

          prompt = `[${begin}:${end}]`;
          msg = 'No match';
          break;

        case 'running':
          nextHistState.testRange = [begin, end + 1];
          nextHistState.matchRanges = histState.matchRanges;

          prompt = `[${begin}:${end}]`;
          const char = ch === ' ' ? "' '" : ch;
          msg = `Char: ${char} - Nodes: ${nextHistState.matchingNodes.length}`;
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  // const nextLog = newLog(nextHistState, state.testString, ch);
  const firstLogIndex = Math.max(histIndex - MAX_LOGS + 1, 0);

  const key = `${begin}-${end}-${histState.runState}`;
  const log = { prompt, msg, key };

  return {
    ...state,
    ...initPlay,
    histIndex: histIndex + 1,
    histEnd: histEnd + 1,
    histStates: [...histStates, nextHistState],
    firstLogIndex,
    logs: [...logs, log],
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
  const pos = histState.testRange[1];

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
