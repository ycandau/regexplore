//------------------------------------------------------------------------------
// Compile the NFA
//------------------------------------------------------------------------------

const HEIGHT = 1;
const QUANT_HEIGHT = 0;

const nodeBase = () => ({
  nextNodes: [],
  gen: 0, // used during simulation
});

const newNode = (token, config) => {
  return { ...token, ...nodeBase(), ...config };
};

const newFragment = (firstNode, terminalNodes, begin, end, height, nodes) => ({
  firstNode,
  terminalNodes,
  begin,
  end,
  height,
  nodes,
});

//------------------------------------------------------------------------------

const connect = (node1, node2, index) => {
  node1.nextNodes.push(node2);
  if (index !== undefined) node2.forkIndex = index;
};

const connectFragment = (frag, node) => {
  frag.terminalNodes.forEach((n) => connect(n, node));
};

const setRange = (token, frag1, frag2) => {
  token.beginL = frag1.begin;
  token.endL = frag1.end;
  if (frag2 !== undefined) {
    token.beginR = frag2.begin;
    token.endR = frag2.end;
  }
};

//------------------------------------------------------------------------------

const concat = (frag1, frag2) => {
  connectFragment(frag1, frag2.firstNode);

  return newFragment(
    frag1.firstNode,
    [...frag2.terminalNodes],
    frag1.begin,
    frag2.end,
    Math.max(frag1.height, frag2.height),
    [...frag1.nodes, ...frag2.nodes]
  );
};

//------------------------------------------------------------------------------

const alternate = (frag1, frag2, token) => {
  const fork = newNode(token);
  const first1 = frag1.firstNode;
  const first2 = frag2.firstNode;
  let nodes = null;

  // No fork merging
  if (first1.type !== '|' && first2.type !== '|') {
    connect(fork, first1, 0);
    connect(fork, first2, 1);

    fork.heights = [frag1.height, frag2.height];
    nodes = [fork, ...frag1.nodes, ...frag2.nodes];
  }

  // Merge left hand fork
  else if (first1.type === '|') {
    first1.nextNodes.forEach((next, ind) => {
      connect(fork, next, ind);
    });
    connect(fork, first2, first1.nextNodes.length);

    fork.heights = [...first1.heights, frag2.height];
    nodes = [fork, ...frag1.nodes.slice(1), ...frag2.nodes];
  } else {
    throw new Error('NFA: Fork merge should not happen');
  }

  setRange(token, frag1, frag2);

  return newFragment(
    fork,
    [...frag1.terminalNodes, ...frag2.terminalNodes],
    frag1.begin,
    frag2.end,
    frag1.height + frag2.height,
    nodes
  );
};

//------------------------------------------------------------------------------

const repeat01 = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  setRange(token, frag);

  return newFragment(
    fork,
    [...frag.terminalNodes, fork],
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    [fork, ...frag.nodes]
  );
};

//------------------------------------------------------------------------------

const repeat0N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  return newFragment(
    fork,
    [fork],
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    [fork, ...frag.nodes]
  );
};

//------------------------------------------------------------------------------

const repeat1N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  return newFragment(
    frag.firstNode,
    [fork],
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    [...frag.nodes, fork]
  );
};
//------------------------------------------------------------------------------

const parentheses = (frag, token) => {
  const open = newNode(token);
  const close = newNode(token, { label: ')', type: ')', index: open.end });
  connect(open, frag.firstNode);
  connectFragment(frag, close);
  open.close = close;

  const height = frag.height;
  const nodes = [open, ...frag.nodes, close];

  return newFragment(open, [close], token.begin, token.end, height, nodes);
};

//------------------------------------------------------------------------------

const pushValue = (fragments, token) => {
  const node = newNode(token);
  const end = token.end || token.index; // in case of bracket expressions
  const height = HEIGHT;

  const fragment = newFragment(node, [node], token.index, end, height, [node]);
  fragments.push(fragment);
};

//------------------------------------------------------------------------------

const unary = (fragments, operation, token) => {
  const frag = fragments.pop();
  fragments.push(operation(frag, token));
};

const binary = (fragments, operation, token) => {
  const frag2 = fragments.pop();
  const frag1 = fragments.pop();
  fragments.push(operation(frag1, frag2, token));
};

//------------------------------------------------------------------------------

const compile = (rpn) => {
  const fragments = [];
  pushValue(fragments, { label: '>', type: 'first' });

  rpn.forEach((token) => {
    switch (token.type) {
      case 'charLiteral':
      case 'escapedChar':
      case 'charClass':
      case 'bracketClass':
      case '.':
        pushValue(fragments, token);
        break;
      case 'empty':
        break;
      case '?':
        unary(fragments, repeat01, token);
        break;
      case '*':
        unary(fragments, repeat0N, token);
        break;
      case '+':
        unary(fragments, repeat1N, token);
        break;
      case '|':
        binary(fragments, alternate, token);
        break;
      case '(':
        unary(fragments, parentheses, token);
        break;
      case '~':
        binary(fragments, concat);
        break;
      default:
        break;
    }
  });

  if (fragments.length === 2) {
    binary(fragments, concat);
  }

  pushValue(fragments, { label: '>', type: 'last' });
  binary(fragments, concat);

  return {
    nfa: fragments[0].firstNode,
    nodes: fragments[0].nodes,
  };
};

//------------------------------------------------------------------------------

const newDisplayNode = (node) => {
  const label = node.type === 'bracketClass' ? '[ ]' : node.label;
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

const mergeNextBack = (node1, node2, prop) => {
  node1.label = node2.label;
  node1.type = node2.type;
  node1.ref = node2.ref;
  node1.ref.dnode = node1;
  node2.type = null;
  node1[prop] = true;
  if (node2.heights !== undefined) node1.heights = node2.heights;
  if (node2.forkIndex !== undefined) node1.forkIndex = node2.forkIndex;
  if (node2.close !== undefined) node1.close = node2.close;
};

//------------------------------------------------------------------------------

const processQuantifiers = (nodes) => {
  nodes.forEach((node) => {
    const next = node.next[0];
    if (node.type === '?') {
      mergeNextBack(node, next, 'repeat01');
      node.next = [...next.next];
    }

    // Repeat 0N
    else if (node.type === '*') {
      const nextType = next.type;
      mergeNextBack(node, next, 'repeat0N');
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
      node.repeat1N = true;
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
  const final = nodes.map((node) => {
    let classes = typeToNodeType[node.type] || '';
    classes +=
      node.repeat01 || node.repeat0N || node.repeat1N ? ' quantifier' : '';
    const fnode = {
      label: node.label,
      coord: node.coord,
      classes,
    };
    return fnode;
  });
  return final;
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
      node.coord = [x0 + 1, y0];
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
  console.log(fnodes);

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

export { compile, graph };
