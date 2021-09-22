//------------------------------------------------------------------------------
// Calculate the graph layout
//
//   - The buildGraph() function returns an object to draw the graph display.
//   - It takes in the array of NFA nodes, filters the quantifiers out,
//     then uses the information from the NFA phase to calculate the layout.
//   - The graph nodes are created as new objects.
//   - The NFA nodes are set with an index to refer to the graph nodes.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Filter the quantifier nodes out and store the indexes in the NFA nodes

const filterNodes = (nodes) => {
  const graphNodes = [];

  nodes.forEach((node) => {
    const type = node.type;
    if (type !== '?' && type !== '*' && type !== '+') {
      node.graphNodeIndex = graphNodes.length;
      graphNodes.push(node);
    }
  });
  return graphNodes;
};

//------------------------------------------------------------------------------
// Convert token types to graph node types to set CSS classes

const typeToGraphNodeType = {
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
// Create the array of graph nodes

const createGraphNodes = (nodes) =>
  nodes.map((node) => {
    const classes =
      typeToGraphNodeType[node.type] + (node.quantifier ? ' quantifier' : '');

    const gnode = {
      label: node.label,
      coord: node.coord,
      classes,
      runClasses: '',
    };

    if (node.quantifier) gnode.quantifier = node.quantifier;

    return gnode;
  });

//------------------------------------------------------------------------------
// Calculate the vertical offset of a graph node following a fork

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
// Calculate the layout of the graph display

const calculateLayout = (nodes) => {
  // Pass 1: Coordinates, and links
  const links = [];
  nodes.forEach((node) => {
    // First
    if (node.type === 'first') {
      node.coord = [0, 0];
    }

    // Fork (no link)
    else if (node.heights) {
      const [x0, y0] = node.prevGraphNodes[0].coord;
      node.coord = [x0, y0];
    }

    // Post fork
    else if (node.forkIndex !== undefined) {
      const fork = node.prevGraphNodes[0];
      const [x0, y0] = fork.coord;
      const dy = forkDeltaY(fork.heights, node.forkIndex);
      node.coord = [x0 + 1, y0 + dy];
    }

    // Merge
    else if (node.prevGraphNodes.length > 1) {
      const top = node.prevGraphNodes[0];
      const bottom = node.prevGraphNodes[node.prevGraphNodes.length - 1];
      const x =
        node.prevGraphNodes.reduce((max, prev) => {
          return Math.max(max, prev.coord[0]);
        }, 0) + 1;
      const y = (top.coord[1] + bottom.coord[1]) / 2;
      node.coord = [x, y];
    }

    // Link
    else if (node.prevGraphNodes.length === 1) {
      const [x0, y0] = node.prevGraphNodes[0].coord;
      node.coord = [x0 + 1, y0];
      links.push([[x0, y0], node.coord]);
    }
  });

  // Pass 2: Forks, merges, and parentheses with quantifiers
  const forks = [];
  const merges = [];
  const parentheses = [];
  nodes.forEach((node) => {
    // Forks
    if (node.heights) {
      const coords = [];
      coords.push(node.coord);
      node.nextGraphNodes.forEach((n) => coords.push(n.coord));
      forks.push(coords);
    }

    // Merges
    else if (node.prevGraphNodes && node.prevGraphNodes.length > 1) {
      const coords = [];
      coords.push(node.coord);
      node.prevGraphNodes.forEach((n) => coords.push(n.coord));
      merges.push(coords);
    }

    // Parentheses with quantifiers
    else if (node.type === '(' && node.quantifier) {
      parentheses.push([node.coord, node.close.coord]);
    }
  });

  const graphNodes = createGraphNodes(nodes);

  return { nodes: graphNodes, links, forks, merges, parentheses };
};

//------------------------------------------------------------------------------

const buildGraph = (nfa) => {
  const filteredNodes = filterNodes(nfa);
  return calculateLayout(filteredNodes);
};

//------------------------------------------------------------------------------

export default buildGraph;
