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

const newGNode = (node) => {
  const gnode = {
    label: node.label,
    type: node.type,
    ref: node,
    previous: [],
  };
  node.gnode = gnode;
  return gnode;
};

const newFragment = (firstNode, terminalNodes, begin, end, height, gnodes) => ({
  firstNode,
  terminalNodes,
  begin,
  end,
  height,
  gnodes,
});

//------------------------------------------------------------------------------

const connect = (node1, node2) => {
  node1.nextNodes.push(node2);
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

const gconnectLink = (gnode1, gnode2) => {
  gnode2.previous.push(gnode1);
};

const gconnectMerge = (frag, gnode) => {
  frag.terminalNodes.forEach((node) => {
    if (node.gnode) {
      gnode.previous.push(node.gnode); // because of repeat01
    }
  });
};

const gconnectBackToFork = (gfork, gnode, forkIndex) => {
  gnode.previous.pop(); // check ok
  gnode.previous.push(gfork);
  gnode.forkIndex = forkIndex;
};

//------------------------------------------------------------------------------

const concat = (frag1, frag2) => {
  connectFragment(frag1, frag2.firstNode);
  gconnectMerge(frag1, frag2.gnodes[0]);

  const terminals = [...frag2.terminalNodes];
  const gnodes = [...frag1.gnodes, ...frag2.gnodes];

  return newFragment(
    frag1.firstNode,
    terminals,
    frag1.begin,
    frag2.end,
    Math.max(frag1.height, frag2.height),
    gnodes
  );
};

//------------------------------------------------------------------------------

const alternate = (frag1, frag2, token) => {
  const fork = newNode(token);
  const gfork = newGNode(fork);
  const first1 = frag1.firstNode;
  const first2 = frag2.firstNode;
  let gnodes = null;

  // No fork merging
  if (first1.type !== '|' && first2.type !== '|') {
    connect(fork, first1);
    connect(fork, first2);

    gconnectBackToFork(gfork, first1.gnode, 0);
    gconnectBackToFork(gfork, first2.gnode, 1);

    gfork.heights = [frag1.height, frag2.height];
    gnodes = [gfork, ...frag1.gnodes, ...frag2.gnodes];
  }

  // Merge left hand fork
  else if (first1.type === '|') {
    first1.nextNodes.forEach((next, ind) => {
      connect(fork, next);
      gconnectBackToFork(gfork, next.gnode, ind);
    });
    connect(fork, first2);
    gconnectBackToFork(gfork, first2.gnode, first1.nextNodes.length);

    gfork.heights = [...first1.gnode.heights, frag2.height];
    gnodes = [gfork, ...frag1.gnodes.slice(1), ...frag2.gnodes];
  } else {
    throw new Error('NFA: Fork merge should not happen');
  }

  setRange(token, frag1, frag2);

  const terminals = [...frag1.terminalNodes, ...frag2.terminalNodes];

  return newFragment(
    fork,
    terminals,
    frag1.begin,
    frag2.end,
    frag1.height + frag2.height,
    gnodes
  );
};

//------------------------------------------------------------------------------

const repeat01 = (frag, token) => {
  const fork = newNode(token);
  fork.gnode = frag.firstNode.gnode; // @check

  connect(fork, frag.firstNode);
  setRange(token, frag);

  const terminals = [...frag.terminalNodes, fork];

  return newFragment(
    fork,
    terminals,
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    frag.gnodes
  );
};

//------------------------------------------------------------------------------

const repeat0N = (frag, token) => {
  const fork = newNode(token);
  const gfork = newGNode(fork);
  gconnectMerge(frag, gfork);

  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  return newFragment(
    fork,
    [fork],
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    [...frag.gnodes, gfork]
  );
};

//------------------------------------------------------------------------------

const repeat1N = (frag, token) => {
  const fork = newNode(token);
  const gfork = newGNode(fork);
  gconnectMerge(frag, gfork);

  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  return newFragment(
    frag.firstNode,
    [fork],
    frag.begin,
    token.index,
    frag.height + QUANT_HEIGHT,
    [...frag.gnodes, gfork]
  );
};
//------------------------------------------------------------------------------

const parentheses = (frag, token) => {
  const open = newNode(token);
  const close = newNode(token, { label: ')', type: ')', index: open.end });
  const gopen = newGNode(open);
  const gclose = newGNode(close);

  connect(open, frag.firstNode);
  connectFragment(frag, close);

  gconnectLink(gopen, frag.firstNode.gnode);
  gconnectMerge(frag, gclose);

  const height = frag.height;
  const gnodes = [gopen, ...frag.gnodes, gclose];

  return newFragment(open, [close], token.begin, token.end, height, gnodes);
};

//------------------------------------------------------------------------------

const pushValue = (fragments, token) => {
  const node = newNode(token);
  const gnode = newGNode(node);
  const end = token.end || token.index; // in case of bracket expressions
  const height = HEIGHT;

  const fragment = newFragment(node, [node], token.index, end, height, [gnode]);
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
    gnodes: fragments[0].gnodes,
  };
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

const graph = (nodes) => {
  const links = [];
  const forks = [];
  const merges = [];

  console.log(nodes);

  nodes.forEach((node) => {
    // First
    if (node.type === 'first') {
      node.coord = [0, 0];
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
        node.previous.reduce((max, node) => {
          return Math.max(max, node.coord[0]);
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
      node.ref.nextNodes.forEach((n) => coords.push(n.gnode.coord));
      forks.push(coords);
    }

    // Merges
    else if (node.previous.length > 1) {
      const coords = [];
      coords.push(node.coord);
      node.previous.forEach((gn) => coords.push(gn.coord));
      merges.push(coords);
    }
  });

  return { nodes, links, forks, merges };
};

//------------------------------------------------------------------------------

export { compile, graph };
