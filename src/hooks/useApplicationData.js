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
const KEEP_PLAYING = 'keepPlaying';

//------------------------------------------------------------------------------
// Initial state

const initRegex = compile('abc');

const initHistory = (regex) => ({
  histIndex: 0,
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
  logsDisplayCount: 10,
  logs: [{ prompt: '[0:0]', key: 0, msg: 'New search' }],
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

const getEnd = (histState) => {
  const msg = 'End of search';
  const nextHistState = {
    ...histState,
    endOfSearch: true,
  };
  return [nextHistState, msg];
};

//------------------------------------------------------------------------------

const getNextHistState = (histState, regex, testString) => {
  const [begin, end] = histState.nextTestRange;
  let msg = null;

  // Initialize or step forward
  const nextHistState =
    histState.runState === 'starting' || histState.runState === 'running'
      ? regex.step(histState.nextNodesToTest, testString, end)
      : regex.init();

  // Defaults
  nextHistState.testRange = histState.nextTestRange;
  nextHistState.matchRanges = histState.matchRanges;

  // Set next range and message
  switch (nextHistState.runState) {
    case 'starting':
      nextHistState.nextTestRange = [begin, end];
      msg = 'New search';
      break;

    case 'running':
      nextHistState.nextTestRange = [begin, end + 1];
      const ch = testString[end] === ' ' ? "' '" : testString[end];
      msg = `Char: ${ch} - Nodes: ${nextHistState.matchingNodes.length}`;
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

    default:
      break;
  }

  return [nextHistState, msg];
};

//------------------------------------------------------------------------------

const stepForward = (state, keepPlaying) => {
  const { regex, testString, histIndex, histStates, logs } = state;
  const histState = histStates[histIndex];
  const [begin, end] = histState.nextTestRange;

  // Block when in play mode
  if (histState.endOfSearch) return { ...state, ...initPlay };

  // Next history state and log message
  const [nextHistState, msg] =
    begin !== testString.length
      ? getNextHistState(histState, regex, testString)
      : getEnd(histState);

  // Set log
  const logsTopIndex = Math.max(histIndex - state.logsDisplayCount + 2, 0);
  const prompt = `[${begin}:${end}]`;
  const key = logs.length;
  const log = { prompt, key, msg };

  // Control play mode
  const playMode = keepPlaying ? { count: state.count + 1 } : initPlay;

  // Finalize
  return {
    ...state,
    ...playMode,
    histIndex: histIndex + 1,
    histStates: [...histStates, nextHistState],
    logsTopIndex,
    logs: [...logs, log],
  };
};

//------------------------------------------------------------------------------

const stepForwardRetrace = (state, keepPlaying) => {
  const { histIndex, logsDisplayCount } = state;
  const logsTopIndex = Math.max(
    histIndex - logsDisplayCount + 1,
    state.logsTopIndex
  );

  // Control play mode
  const playMode = keepPlaying ? { count: state.count + 1 } : initPlay;

  return {
    ...state,
    ...playMode,
    histIndex: histIndex + 1,
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

//------------------------------------------------------------------------------

const backToBeginning = (state) => {
  return {
    ...state,
    ...initPlay,
    histIndex: 0,
    logsTopIndex: 0,
  };
};

//------------------------------------------------------------------------------

const play = (state) => {
  return {
    ...state,
    play: !state.play,
  };
};

//------------------------------------------------------------------------------
// Reducer

const appStateReducer = (state, action) => {
  const { histIndex, histStates } = state;

  switch (action.type) {
    case REGEX:
      return setRegex(state, action);

    case TEST_STR:
      return setTestString(state, action);

    case FORWARD:
      if (histIndex < histStates.length - 1) {
        return stepForwardRetrace(state);
      }
      return stepForward(state);

    case BACKWARD:
      return stepBackward(state);

    case BEGINNING:
      return backToBeginning(state);

    case PLAY:
      return play(state);

    case KEEP_PLAYING:
      if (histIndex < histStates.length - 1) {
        return stepForwardRetrace(state, true);
      }
      return stepForward(state, true);

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
  const keepPlaying = useCallback(() => dispatch({ type: KEEP_PLAYING }), []);
  const play = useCallback(() => dispatch({ type: PLAY }), []);

  return [
    state,
    {
      setRegex,
      setTestString,
      stepForward,
      stepBackward,
      toBeginning,
      keepPlaying,
      play,
    },
  ];
};

//------------------------------------------------------------------------------

export default useApplicationData;
