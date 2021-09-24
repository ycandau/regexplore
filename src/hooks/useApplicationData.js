import { useReducer, useCallback } from 'react';

//------------------------------------------------------------------------------

const MAX_LOGS = 8;

const actionTypes = {
  stepForward: 'forward',
  stepBackward: 'backward',
  toBegin: 'begin',
};

//------------------------------------------------------------------------------

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

const jumpToBeginning = (state) => {
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

const appStateReducer = (state, action) => {
  const { histIndex, histStates, testString } = state;
  const histState = histStates[histIndex];
  const [begin, pos] = histState.testRange;

  switch (action.type) {
    // Step forward
    case actionTypes.stepForward:
      if (pos === testString.length) return state;
      if (histIndex < histStates.length - 1) return stepForwardRetrace(state);
      return stepForward(state);

    case actionTypes.stepBackward:
      if (histIndex === 0) return state;
      return stepBackward(state);
      break;

    //Default
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
      break;
  }
};

//------------------------------------------------------------------------------

const useApplicationData = () => {
  const [state, dispatch] = useReducer({
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
    play: false,
    count: 0,
    logFirst: 0,
    logList: [],
  });

  const setRegex = useCallback((regex) => dispatch({ type: 'REGEX', regex }));
};
