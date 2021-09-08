//------------------------------------------------------------------------------
// Prepare the data to draw the graph
//------------------------------------------------------------------------------

const newDisplayNode = (node) => {
  const label = node.type === 'bracketClass' ? '[]' : node.label;
  const dnode = { label, type: node.type, ref: node };
  node.dnode = dnode;
  if (node.heights !== undefined) dnode.heights = node.heights;
  if (node.forkIndex !== undefined) dnode.forkIndex = node.forkIndex;
  if (node.close !== undefined) dnode.close = node.close;
  return dnode;
};

//------------------------------------------------------------------------------

const createDisplayNodes = (nodes) => {
  const dnodes = nodes.map(newDisplayNode);

  // Transfer next node references
  dnodes.forEach((dnode) => {
    dnode.next = dnode.ref.nextNodes.map((node) => node.dnode);
    if (dnode.close !== undefined) dnode.close = dnode.close.dnode;
  });
  return dnodes;
};

//------------------------------------------------------------------------------

const mergeNextBack = (node1, node2, quantifier) => {
  node1.quantifier = node1.type;
  node1.label = node2.label;
  node1.type = node2.type;
  node1.ref = node2.ref;
  node1.ref.dnode = node1;
  node2.type = null;
  if (node2.heights !== undefined) node1.heights = node2.heights;
  if (node2.forkIndex !== undefined) node1.forkIndex = node2.forkIndex;
  if (node2.close !== undefined) node1.close = node2.close;
};

//------------------------------------------------------------------------------

const processQuantifiers = (nodes) => {
  nodes.forEach((node) => {
    const next = node.next[0];
    if (node.type === '?') {
      mergeNextBack(node, next);
      node.next = [...next.next];
    }

    // Repeat 0N
    else if (node.type === '*') {
      const nextType = next.type;
      mergeNextBack(node, next);
      if (nextType === '(') {
        node.close.next = [node.next[1]];
        node.next = [...next.next];
      } else {
        node.next = [node.next[1]];
      }
    }

    // Repeat1N
    else if (next && next.type === '+') {
      next.type = null;
      node.next = [next.next[1]];
      node.quantifier = '+';
    }
  });
  return nodes.filter((node) => node.type !== null);
};

const setPreviousNodes = (nodes) => {
  nodes.forEach((node) => (node.previous = []));
  nodes.forEach((prev) => {
    prev.next.forEach((node) => node.previous.push(prev));
  });
  return nodes;
};

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

const finalizeDisplayNodes = (nodes) => {
  const graphNodes = nodes.map((node, ind) => {
    // Set the index in the NFA
    node.ref.graphNodeIndex = ind;

    const addClass = node.quantifier ? ' quantifier' : '';
    const classes = `${typeToNodeType[node.type]} ${addClass}`;

    return {
      label: node.label,
      coord: node.coord,
      classes,
      active: false,
      quantifier: node.quantifier,
    };
  });
  return graphNodes;
};

//------------------------------------------------------------------------------

const calculateLayout = (nodes) => {
  const links = [];
  const forks = [];
  const merges = [];

  nodes.forEach((node) => {
    // First
    if (node.type === 'first') {
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

  const fnodes = finalizeDisplayNodes(nodes);

  // console.log('RE', fnodes);

  return { nodes: fnodes, links, forks, merges };
};

//------------------------------------------------------------------------------

const graph = (nodes) => {
  const displayNodes = createDisplayNodes(nodes);
  const filteredNodes = processQuantifiers(displayNodes);
  const nodesWithPrevious = setPreviousNodes(filteredNodes);
  const graph = calculateLayout(nodesWithPrevious);

  return graph;
};

//------------------------------------------------------------------------------

export default graph;
