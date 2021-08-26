//------------------------------------------------------------------------------
// Fragment class
//
// Used while compiling the non-deterministic finite automata (NFA).
// Each fragment keeps track of a temporary branch of the graph, including:
//   - a first state, and
//   - a list of terminal states
//------------------------------------------------------------------------------

import { getFirstState, getTerminalStates } from './re_helpers.js';
import State from './re_state.js';

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

  concat(frag2) {
    this.connectTo(frag2);
    return new Fragment(this, [frag2]);
  }

  alternate(frag2) {
    const fork = new State('fork', '|');
    fork.connectTo(this);
    fork.connectTo(frag2);
    return new Fragment(fork, [this, frag2]);
  }

  repeat01() {
    const fork = new State('fork', '?');
    fork.connectTo(this);
    return new Fragment(fork, [this, fork]);
  }

  repeat0N() {
    const fork = new State('fork', '*');
    fork.connectTo(this);
    this.connectTo(fork);
    return new Fragment(fork, [fork]);
  }

  repeat1N() {
    const fork = new State('fork', '+');
    fork.connectTo(this);
    this.connectTo(fork);
    return new Fragment(this, [fork]);
  }
}

//------------------------------------------------------------------------------

export default Fragment;
