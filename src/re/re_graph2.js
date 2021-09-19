//------------------------------------------------------------------------------
// Calculate the graph layout
//------------------------------------------------------------------------------

const forkDeltaY = (heights, index) => {
  let dy = 0;
  let sum = 0;
  for (let i = 0; i < heights.length; i++) {
    dy += i < index ? heights[i] : 0;
    sum += heights[i];
  }
  dy += heights[index] / 2;
  const offset = (heights[0] / 2 + sum - heights[heights.length - 1] / 2) / 2;
  return dy - offset;
};

//------------------------------------------------------------------------------

const typeToNodeType = {
  charLiteral: 'value',
  escapedChar: 'value-special',
  charClass: 'value-special',
  bracketClass: 'value-special',
  '.': 'value-special',
  '|': 'operator',
  '(': 'delimiter',
  ')': 'delimiter',
  first: 'first',
  last: 'last',
};

//------------------------------------------------------------------------------

const calculateLayout = (nodes) => {
  const links = [];
  const forks = [];
  const merges = [];

  nodes.forEach((node) => {
    if (node.type === '?' || node.type === '*' || node.type === '+') {
      return;
    }

    // First
    else if (node.type === 'first') {
      node.coord = [0, 0];
    } else if (node.type === null) {
    }

    // Fork
    else if (node.heights) {
      const [x0, y0] = node.previous[0].coord;
      node.coord = [x0, y0];
      links.push([[x0, y0], node.coord]);
    }

    // Post fork
    else if (node.forkIndex !== undefined) {
      const fork = node.previous[0];
      const [x0, y0] = fork.coord;
      const dy = forkDeltaY(fork.heights, node.forkIndex);
      node.coord = [x0 + 1, y0 + dy];
    }

    // Merge
    else if (node.previous.length > 1) {
      const top = node.previous[0];
      const bottom = node.previous[node.previous.length - 1];
      const x =
        node.previous.reduce((max, prev) => {
          return Math.max(max, prev.coord[0]);
        }, 0) + 1;
      const y = (top.coord[1] + bottom.coord[1]) / 2;
      node.coord = [x, y];
    }

    // Link
    else if (node.previous.length === 1) {
      const [x0, y0] = node.previous[0].coord;
      node.coord = [x0 + 1, y0];
      links.push([[x0, y0], node.coord]);
    }
  });

  nodes.forEach((node) => {
    // Forks
    if (node.heights) {
      const coords = [];
      coords.push(node.coord);
      node.next.forEach((n) => coords.push(n.coord));
      forks.push(coords);
    }

    // Merges
    else if (node.previous.length > 1) {
      const coords = [];
      coords.push(node.coord);
      node.previous.forEach((n) => coords.push(n.coord));
      merges.push(coords);
    }
  });

  // Parentheses with quantifiers
  let coord = [];
  const parentheses = [];
  nodes.forEach((node) => {
    if (node.label === '(' && node.quantifier) {
      coord.push(node.coord);
    }
    if (node.label === ')' && node.quantifier) {
      parentheses.push([coord.pop(), node.coord]);
    }
  });

  return { nodes, links, forks, merges, parentheses };
};

//------------------------------------------------------------------------------

const buildGraph = (nodes) => {
  const graph = calculateLayout(nodes);
  return graph;
};

//------------------------------------------------------------------------------

export default buildGraph;
