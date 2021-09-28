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
      matchRanges: [],
      logsCurrentIndex: 0,
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
  const [begin, end] = histState.testRange;

  let nextHistState = null;
  let prompt = null;
  let msg = null;
  let endOfTestString = false;

  switch (histState.runState) {
    case 'success':
      nextHistState = regex.init(); // starting
      nextHistState.testRange = [end + 1, end + 1];
      nextHistState.matchRanges = histState.matchRanges;

      prompt = `[${end + 1}:${end + 1}]`;
      msg = 'New search';
      break;

    case 'failure':
      nextHistState = regex.init(); // starting
      nextHistState.testRange = [begin + 1, begin + 1];
      nextHistState.matchRanges = histState.matchRanges;

      prompt = `[${begin + 1}:${begin + 1}]`;
      msg = 'New search';
      break;

    case 'starting':
    case 'running':
      const ch = testString[end];
      nextHistState = regex.step(histState.nextNodesToTest, ch);

      switch (nextHistState.runState) {
        case 'success':
          nextHistState.testRange = [begin, end];
          nextHistState.matchRanges = [...histState.matchRanges, [begin, end]];

          prompt = `[${begin}:${end}]`;
          msg = `Match: ${testString.slice(begin, end + 1)}`;
          endOfTestString = end + 1 === testString.length;
          break;

        case 'failure':
          nextHistState.testRange = [begin, end];
          nextHistState.matchRanges = histState.matchRanges;

          prompt = `[${begin}:${end}]`;
          msg = 'No match';
          endOfTestString = begin + 1 === testString.length;
          break;

        case 'running':
          nextHistState.testRange = [begin, end + 1];
          nextHistState.matchRanges = histState.matchRanges;

          prompt = `[${begin}:${end}]`;
          const char = ch === ' ' ? "' '" : ch;
          msg = `Char: ${char} - Nodes: ${nextHistState.matchingNodes.length}`;
          endOfTestString = end + 1 === testString.length;
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  // Logs
  const key = `${begin}-${end}-${histState.runState}`;
  const log = { prompt, msg, key };
  const newLogs = [...logs, log];

  if (endOfTestString) {
    newLogs.push({ prompt, msg: 'End of test string', key: 'end' });
  }

  const logsCurrentIndex = newLogs.length - 1;
  const logsTopIndex = Math.max(
    logsCurrentIndex - state.logsDisplayCount + 1,
    0
  );
  nextHistState.logsCurrentIndex = logsCurrentIndex;

  // Finalize
  return {
    ...state,
    ...initPlay,
    histIndex: histIndex + 1,
    histEnd: histEnd + 1,
    histStates: [...histStates, nextHistState],
    logsTopIndex,
    logs: newLogs,
  };
};

//------------------------------------------------------------------------------

const stepForwardRetrace = (state) => {
  const histIndex = state.histIndex + 1;
  const logsCurrentIndex = state.histStates[histIndex].logsCurrentIndex;
  const logsTopIndex = Math.max(
    logsCurrentIndex - state.logsDisplayCount + 1,
    0
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
  const logsCurrentIndex = state.histStates[histIndex].logsCurrentIndex;
  const logsTopIndex = Math.min(logsCurrentIndex, state.logsTopIndex);

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
