//------------------------------------------------------------------------------
// Fragment class
//
// Used while compiling the non-deterministic finite automata (NFA).
// Each fragment keeps track of a temporary branch of the graph, including:
//   - a first state, and
//   - a list of terminal states
//------------------------------------------------------------------------------

import { getFirstState, getTerminalStates } from './re_helpers.js';
import State from './re_states.js';

//------------------------------------------------------------------------------

class Fragment {
  constructor(first, terminals) {
    this.firstState = getFirstState(first);
    this.terminalStates = terminals
      ? terminals.map(getTerminalStates).flat()
      : [first];
  }

  connectTo(next) {
    this.terminalStates.forEach((state) => state.connectTo(next));
  }
}

const concat = (frag1, frag2) => {
  frag1.connectTo(frag2);
  return new Fragment(frag1, [frag2]);
};

const alternate = (frag1, frag2) => {
  const fork = new State('fork', '|');
  fork.connectTo(frag1);
  fork.connectTo(frag2);
  return new Fragment(fork, [frag1, frag2]);
};

const repeat01 = (frag) => {
  const fork = new State('fork', '?');
  fork.connectTo(frag);
  return new Fragment(fork, [frag, fork]);
};

const repeat0N = (frag) => {
  const fork = new State('fork', '*');
  fork.connectTo(frag);
  frag.connectTo(fork);
  return new Fragment(fork, [fork]);
};

const repeat1N = (frag) => {
  const fork = new State('fork', '+');
  fork.connectTo(frag);
  frag.connectTo(fork);
  return new Fragment(frag, [fork]);
};

//------------------------------------------------------------------------------

export default Fragment;
export { concat, alternate, repeat01, repeat0N, repeat1N };
