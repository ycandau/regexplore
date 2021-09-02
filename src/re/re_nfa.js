//------------------------------------------------------------------------------
// Compile the NFA
//------------------------------------------------------------------------------

const HEIGHT = 1;
const QUANT_HEIGHT = 0.5;

const nodeBase = () => ({
  nextNodes: [],
  nextLink: null,
  gen: 0, // used during simulation
});

const newNode = (token, config) => {
  return { ...token, ...nodeBase(), ...config };
};

const newFragment = (
  firstNode,
  terminalNodes,
  begin,
  end,
  lastNode,
  height
) => {
  return { firstNode, terminalNodes, begin, end, lastNode, height };
};

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

//------------------------------------------------------------------------------

const concat = (frag1, frag2) => {
  connectFragment(frag1, frag2.firstNode);

  frag1.lastNode.nextLink = frag2.firstNode;
  const height = Math.max(frag1.height, frag2.height);

  const terminals = [...frag2.terminalNodes];
  return newFragment(
    frag1.firstNode,
    terminals,
    frag1.begin,
    frag2.end,
    frag2.lastNode,
    height
  );
};

const alternate = (frag1, frag2, token) => {
  const fork = newNode(token);
  connect(fork, frag1.firstNode);
  connect(fork, frag2.firstNode);
  setRange(token, frag1, frag2);

  fork.nextLink = frag1.firstNode;
  frag1.lastNode.nextLink = frag2.firstNode;
  const height = frag1.height + frag2.height;
  fork.heights = [frag1.height, frag2.height];

  const terminals = [...frag1.terminalNodes, ...frag2.terminalNodes];
  return newFragment(
    fork,
    terminals,
    frag1.begin,
    frag2.end,
    frag2.lastNode,
    height
  );
};

const repeat01 = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  setRange(token, frag);

  fork.nextLink = frag.firstNode;
  const height = frag.height + QUANT_HEIGHT;

  const terminals = [...frag.terminalNodes, fork];
  return newFragment(
    fork,
    terminals,
    frag.begin,
    token.index,
    frag.lastNode,
    height
  );
};

const repeat0N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  fork.nextLink = frag.firstNode;
  const height = frag.height + QUANT_HEIGHT;

  return newFragment(
    fork,
    [fork],
    frag.begin,
    token.index,
    frag.lastNode,
    height
  );
};

const repeat1N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);

  frag.lastNode.nextLink = fork;
  const height = frag.height + QUANT_HEIGHT;

  return newFragment(
    frag.firstNode,
    [fork],
    frag.begin,
    token.index,
    fork,
    height
  );
};

const parentheses = (frag, token) => {
  const open = newNode(token);
  const close = newNode(token, { label: ')', type: ')', index: open.end });
  connect(open, frag.firstNode);
  connectFragment(frag, close);

  open.nextLink = frag.firstNode;
  frag.lastNode.nextLink = close;
  const height = frag.height;

  return newFragment(open, [close], token.begin, token.end, close, height);
};

//------------------------------------------------------------------------------

const pushValue = (fragments, token) => {
  const node = newNode(token);
  const end = token.end || token.index; // in case of bracket expressions
  const height = HEIGHT;
  const fragment = newFragment(node, [node], token.index, end, node, height);
  fragments.push(fragment);
};

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

  binary(fragments, concat);
  pushValue(fragments, { label: '>', type: 'last' });
  binary(fragments, concat);

  return fragments[0].firstNode;
};

//------------------------------------------------------------------------------

const list = (first) => {
  const array = [];
  let node = first;
  while (node !== null) {
    array.push(node);
    node = node.nextLink;
  }
  return array;
};

//------------------------------------------------------------------------------

export { compile, list };
