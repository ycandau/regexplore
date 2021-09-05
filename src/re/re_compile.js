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

export default compile;
