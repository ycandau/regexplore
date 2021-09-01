//------------------------------------------------------------------------------
// Compile the NFA
//------------------------------------------------------------------------------

// import { inspect } from './re_helpers.js';

// const REG_HEIGHT = 1;
// const REPEAT_HEIGHT = 0.5;

//------------------------------------------------------------------------------

const nodeBase = () => ({
  nextNodes: [],
  gen: 0, // used during simulation
  height: 1,
});

const newNode = (token, config) => {
  return { ...token, ...nodeBase(), ...config };
};

const newFragment = (firstNode, terminalNodes, begin, end) => {
  return { firstNode, terminalNodes, begin, end };
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
  const terminals = [...frag2.terminalNodes];
  return newFragment(frag1.firstNode, terminals, frag1.begin, frag2.end);
};

const alternate = (frag1, frag2, token) => {
  const fork = newNode(token);
  connect(fork, frag1.firstNode);
  connect(fork, frag2.firstNode);
  setRange(token, frag1, frag2);
  const terminals = [...frag1.terminalNodes, ...frag2.terminalNodes];
  return newFragment(fork, terminals, frag1.begin, frag2.end);
};

const repeat01 = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  setRange(token, frag);
  const terminals = [...frag.terminalNodes, fork];
  return newFragment(fork, terminals, frag.begin, token.index);
};

const repeat0N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);
  return newFragment(fork, [fork], frag.begin, token.index);
};

const repeat1N = (frag, token) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setRange(token, frag);
  return newFragment(frag.firstNode, [fork], frag.begin, token.index);
};

const parentheses = (frag, token) => {
  const open = newNode(token);
  const close = newNode(token, { label: ')', type: ')', index: open.end });
  connect(open, frag.firstNode);
  connectFragment(frag, close);
  return newFragment(open, [close], token.begin, token.end);
};

//------------------------------------------------------------------------------

const pushValue = (fragments, token) => {
  const node = newNode(token);
  const end = token.end || token.index;
  const fragment = newFragment(node, [node], token.index, end);
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

const log = (node) => {
  const toStr = (n) => `[${n.label}]`;
  const nextNodes = node.nextNodes.map(toStr).join(', ');
  console.log(`  ${toStr(node)} => ${nextNodes}`);
};

const logGraph = (node) => {
  if (node.done || node.type === 'last') return;
  node.done = true;
  log(node);
  node.nextNodes.forEach((n) => logGraph(n));
};

//------------------------------------------------------------------------------

export { compile, logGraph };
