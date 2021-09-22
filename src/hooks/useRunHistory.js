import { useState } from 'react';

import compile from '../regex/re_compile';
import { initNFA, stepForward } from '../regex/re_run';

//------------------------------------------------------------------------------

const initHistory = (regex) => {
  const { matchingNodes, nextNodesToTest } = initNFA(regex.nfa);

  return {
    index: 0,
    end: -1,
    states: [
      {
        runState: 'running',
        matchingNodes,
        nextNodesToTest,
        testRange: [0, 0],
        matchRanges: [],
      },
    ],
  };
};

const defaultRegex = compile('abc');
const defaultHistory = initHistory(defaultRegex);

//------------------------------------------------------------------------------

const useRunHistory = () => {
  const [history, setHistory] = useState(defaultHistory);

  const onStepForward = () => {
    const prevIndex = history.index;
    let end = history.end;
    const prevState = history.states[prevIndex];
    let prevNextNodesToTest = prevState.nextNodesToTest;

    const prevTestRange = prevState.testRange;
    const prevRunState = prevState.runState;

    // Return if at end of test string
    const [begin, prevPos] = prevTestRange;
    if (prevPos === testString.length) {
      setPlay(false);
      return;
    }

    // Retrace a forward step already taken
    const index = prevIndex + 1;
    if (prevIndex < history.states.length - 1) {
      setHistory({ ...history, index });
      const first = Math.max(history.index - MAX_LOGS + 1, 0);
      setLogs({ ...logs, first });
      return;
    }

    if (prevRunState === 'success' || prevRunState === 'failure') {
      const reset = initNFA(regex.nfa);
      prevNextNodesToTest = reset.nextNodesToTest;
    }

    // Run the next step
    const ch = testString[prevPos];
    const char = ch === ' ' ? "' '" : ch;
    let { runState, matchingNodes, nextNodesToTest } = stepForward(
      prevNextNodesToTest,
      testString,
      prevPos
    );

    const pos = prevPos + 1;
    let testRange = [];
    const matchRanges = [...prevState.matchRanges];
    let msg = '';

    switch (runState) {
      case 'running':
        testRange = [begin, pos];
        msg = `Char: ${char} - Nodes: ${matchingNodes.length}`;
        break;
      case 'success':
        testRange = [pos, pos];
        matchRanges.push([begin, pos]);
        msg = `Match: ${testString.slice(begin, pos)}`;
        break;
      case 'failure':
        testRange = [begin + 1, begin + 1];
        msg = 'No match';
        break;
      case 'end':
        testRange = [pos, pos];
        msg = 'End of test string';
        end = index;
        setPlay(false);
        break;
      default:
        break;
    }

    // Create a new log entry
    const first = Math.max(history.index - MAX_LOGS + 1, 0);
    const prompt = `[${begin}:${pos}]`;
    const log = { prompt, msg, key: history.index + 1 };
    const list = [...logs.list, log];
    setLogs({ first, list });

    // Set the next history state
    const nextState = {
      runState,
      matchingNodes,
      nextNodesToTest,
      testRange,
      matchRanges,
    };
    setHistory({
      ...history,
      index,
      end,
      states: [...history.states, nextState],
    });
  };

  const onStepBack = () => {
    if (history.index === 0) return;
    setHistory({ ...history, index: history.index - 1 });
    const first = Math.max(Math.min(history.index - 2, logs.first), 0);
    setLogs({ ...logs, first });
  };

  const onToBeginning = () => {
    setHistory({ ...history, index: 0 });
    setLogs({ ...logs, first: 0 });
  };

  const onPlay = () => {
    setPlay((play) => !play);
  };
};
