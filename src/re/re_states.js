//------------------------------------------------------------------------------
// State class
//
// Used to compile the non-deterministic finite automata (NFA).
// Each state corresponds to either a character class or a fork in the graph.
//------------------------------------------------------------------------------

import { getFirstState } from './re_helpers.js';

//------------------------------------------------------------------------------

class State {
  constructor(label, type, config = {}) {
    this.label = label;
    this.type = type;
    this.nextStates = [];
    this.generation = 0; // used during simulation
    for (const prop in config) this[prop] = config[prop];
  }

  connectTo(next) {
    this.nextStates.push(getFirstState(next));
    return next;
  }

  log() {
    const toStr = (state) => `[${state.label}]`;
    const nextStates = this.nextStates.map(toStr).join(', ');
    console.log(`  ${toStr(this)} => ${nextStates}`);
  }

  logAll() {
    if (this.done || this.type === 'last') return;
    this.done = true;
    this.log();
    this.nextStates.forEach((s) => s.logAll());
  }
}

export default State;
