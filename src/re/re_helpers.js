//------------------------------------------------------------------------------
// re_helpers.js
//------------------------------------------------------------------------------

/**
 * Get the last element from an array.
 *
 * @param {*} array An array.
 * @returns The last element of the array.
 */
const last = (array) => array[array.length - 1];

/**
 * Print a heading to the console.
 *
 * @param {*} str The heading to log
 */
const logHeading = (str, ...rest) =>
  console.log(`----------------\n${str}:`, ...rest);

/**
 * To connect to a Fragment or State independently of the class.
 *
 * @param {*} graph Can be a State or a Fragment.
 * @returns The first state of a Fragment, or the State itself.
 */
const getFirstState = (graph) => (graph.firstState ? graph.firstState : graph);

/**
 * To connect from a Fragment or State independently of the class.
 *
 * @param {*} graph Can be a State or a Fragment.
 * @returns The terminal states of a Fragment, or the State itself.
 */
const getTerminalStates = (graph) =>
  graph.terminalStates ? graph.terminalStates : graph;

/**
 * Generate a string from a flat object.
 *
 * @param {*} obj A flat object.
 * @returns A string.
 */
const toString = (obj) => {
  const entries = Object.entries(obj).map(([key, value]) => `${key}: ${value}`);
  const length = entries.reduce((count, { length }) => count + length, 0);
  const separator = length <= 60 ? ', ' : '\n    ';
  return `{ ${entries.join(separator)} }`;
};

//------------------------------------------------------------------------------

export { last, logHeading, getFirstState, getTerminalStates, toString };
