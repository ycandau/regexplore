//------------------------------------------------------------------------------
// re_helpers.js
//------------------------------------------------------------------------------

/**
 * Print a heading to the console.
 *
 * @param {*} str The heading to log
 */
const logHeading = (str, ...rest) =>
  console.log(`----------------\n${str}:`, ...rest);

/**
 * Generate a string from a flat object which includes a label and type.
 *
 * @param {*} obj A flat object.
 * @returns A string.
 */
const toString = (obj) => {
  const entries = Object.entries(obj)
    .filter(([key, value]) => key !== 'label')
    .map(([key, value]) => `${key}: ${value}`);
  const length = entries.reduce((count, { length }) => count + length, 0);
  const separator = length <= 80 ? ', ' : '\n    ';
  return `{ ${entries.join(separator)} }`;
};

/**
 * Log a flat object which includes a label and type.
 *
 * @param {*} obj A flat object.
 * @returns A string.
 */
const inspect = (...keys) => (obj) => {
  const entries = Object.entries(obj)
    .filter(([key]) => key !== 'label' && key !== 'type')
    .filter(([key]) => keys.length === 0 || keys.includes(key))
    .map(([key, value]) => `${key}: ${value}`);
  const length = entries.reduce((count, { length }) => count + length, 0);
  const separator = length <= 60 ? ', ' : '\n    ';
  const str = `  ${obj.label} : { ${entries.join(separator)} }`;
  console.log(str);
};

//------------------------------------------------------------------------------

export { logHeading, toString, inspect };
