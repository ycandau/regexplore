//------------------------------------------------------------------------------
// Calculate the graph layout
//------------------------------------------------------------------------------

const copyProps = (src, dest, props) => {
  props.forEach((prop) => {
    if (src[prop] !== undefined) dest[prop] = src[prop];
  });
};

//------------------------------------------------------------------------------

const newDisplayNode = (node) => {
  const label = node.type === 'bracketClass' ? '[]' : node.label;
  const dnode = { label, type: node.type, ref: node, previous: [] };
  node.dnode = dnode;
  if (node.heights !== undefined) dnode.heights = node.heights;
  if (node.forkIndex !== undefined) dnode.forkIndex = node.forkIndex;
  if (node.close !== undefined) dnode.close = node.close;
  if (node.open !== undefined) dnode.open = node.open;
  return dnode;
};

//------------------------------------------------------------------------------

const createDisplayNodes = (nodes) => {
  const dnodes = nodes.map(newDisplayNode);

  // Transfer next node references
  dnodes.forEach((dnode) => {
    switch (dnode.type) {
      case '|':
        dnode.next = dnode.ref.nextNodes.map((node) => node.dnode);
        break;
      case '?':
        dnode.next = [dnode.ref.nextNodes[0].dnode];
        break;
      case '*':
        dnode.next = [dnode.ref.nextNodes[0].dnode];
        break;
      case '+':
        dnode.next = [dnode.ref.nextNodes[1].dnode];
        break;
      case 'last':
        dnode.next = [];
        break;
      default:
        dnode.next = [dnode.ref.nextNodes[0].dnode];
        break;
    }

    // dnode.next = dnode.ref.nextNodes.map((node) => node.dnode);

    if (dnode.close !== undefined) dnode.close = dnode.close.dnode;
    if (dnode.open !== undefined) dnode.open = dnode.open.dnode;

    dnode.next.forEach((next) => next.previous.push(dnode));
  });
  return dnodes;
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

    let addClass = '';

    if (node.quantifier) {
      addClass = ' quantifier';
    }

    // Transfer quantifier from ( to )
    if (node.quantifier && node.close && node.label === '(') {
      node.close.quantifier = node.quantifier;
      node.quantifier = 'open';
    }

    // Transfer quantifier from ) to (
    if (node.close && node.close.quantifier === '+') {
      addClass = ' quantifier';
      node.quantifier = 'open';
    }

    const classes = `${typeToNodeType[node.type]}${addClass}`;

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

  // Parentheses with quantifiers
  let coord = [];
  const parentheses = [];
  fnodes.forEach((node) => {
    if (node.label === '(' && node.quantifier) {
      coord.push(node.coord);
    }
    if (node.label === ')' && node.quantifier) {
      parentheses.push([coord.pop(), node.coord]);
    }
  });

  return { nodes: fnodes, links, forks, merges, parentheses };
};

//------------------------------------------------------------------------------

const buildGraph = (nodes) => {
  const displayNodes = createDisplayNodes(nodes);
  console.log(displayNodes);
  const graph = calculateLayout(displayNodes);

  return graph;
};

//------------------------------------------------------------------------------

export default buildGraph;
