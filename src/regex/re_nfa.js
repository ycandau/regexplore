//------------------------------------------------------------------------------
// Compile the regex into a nondeterministic finite automata
//
//   - The buildNFA() function returns an array of connected nodes.
//   - And it mutates the lexemes by adding information on operand ranges.
//   - Two graphs are actually built:
//     - One for the NFA used to run the regex.
//     - One for the graph display, which bypasses quantifier nodes.
//     - Building two graphs is less messy than dealing with quantifiers later.
//------------------------------------------------------------------------------

const HEIGHT = 1;

//------------------------------------------------------------------------------
// Create node and fragment objects

const newNode = (token, config) => ({ ...token, nextNodes: [], ...config });

const newFragment = (
  // To build the NFA
  firstNode, // first node in the fragment
  terminalNodes, // array of terminal nodes
  nodes, // an ordered array of nodes

  // To track operands
  begin, // index of the first node in the fragment
  end, // index of the last node in the fragment

  // To build the graph display (without quantifiers)
  firstGraphNode,
  terminalGraphNodes,
  height // to calculate the graph layout
) => ({
  firstNode,
  terminalNodes,
  nodes,
  begin,
  end,
  firstGraphNode,
  terminalGraphNodes,
  height,
});

//------------------------------------------------------------------------------
// Helper functions: Connect the NFA nodes and fragments

const connect = (node1, node2) => {
  node1.nextNodes.push(node2);
};

const connectFragment = (frag, node) => {
  frag.terminalNodes.forEach((n) => connect(n, node));
};

//------------------------------------------------------------------------------
// Helper function: Set the ranges of operator lexemes

const setOperatorRange = (lexeme, frag1, frag2) => {
  lexeme.beginL = frag1.begin;
  lexeme.endL = frag1.end;
  if (frag2 !== undefined) {
    lexeme.beginR = frag2.begin;
    lexeme.endR = frag2.end;
  }
};

//------------------------------------------------------------------------------
// Helper functions: Connect the graph display nodes

const graphLink = (node1, node2) => {
  node2.prevGraphNodes = [node1];
};

const graphFork = (node1, node2, index) => {
  node1.nextGraphNodes.push(node2);
  node2.prevGraphNodes = [node1];
  node2.forkIndex = index;
};

const graphMerge = (nodes, node2) => {
  node2.prevGraphNodes = [...nodes];
};

const setQuantifier = (frag, quantifier) => {
  // Redundant for values
  // Open and close for parentheses
  frag.firstGraphNode.quantifier = quantifier;
  frag.terminalGraphNodes[0].quantifier = quantifier;
};

//------------------------------------------------------------------------------
// Concatenate two fragments

const concat = (frag1, frag2) => {
  connectFragment(frag1, frag2.firstNode);

  graphMerge(frag1.terminalGraphNodes, frag2.firstGraphNode);

  return newFragment(
    // NFA
    frag1.firstNode,
    frag2.terminalNodes,
    [...frag1.nodes, ...frag2.nodes],

    // Operands
    frag1.begin,
    frag2.end,

    // Graph display
    frag1.firstGraphNode,
    frag2.terminalGraphNodes,
    Math.max(frag1.height, frag2.height)
  );
};

//------------------------------------------------------------------------------
// Alternate two fragments
// Also merges multiple alternations into one

const alternate = (frag1, frag2, token, lexemes) => {
  const fork = newNode(token);
  const first1 = frag1.firstNode;
  const first2 = frag2.firstNode;
  let nodes = null;

  // No fork merging
  if (first1.type !== '|' && first2.type !== '|') {
    // NFA
    connect(fork, first1);
    connect(fork, first2);
    nodes = [fork, ...frag1.nodes, ...frag2.nodes];

    // Graph display
    fork.nextGraphNodes = [];
    graphFork(fork, frag1.firstGraphNode, 0);
    graphFork(fork, frag2.firstGraphNode, 1);
    fork.heights = [frag1.height, frag2.height];
  }

  // Merge left hand fork
  else if (first1.type === '|') {
    // NFA
    first1.nextNodes.forEach((next) => connect(fork, next));
    connect(fork, first2);
    nodes = [fork, ...frag1.nodes.slice(1), ...frag2.nodes];

    // Graph display
    fork.nextGraphNodes = [];
    first1.nextGraphNodes.forEach((next, ind) => graphFork(fork, next, ind));
    graphFork(fork, frag2.firstGraphNode, first1.nextGraphNodes.length);
    fork.heights = [...first1.heights, frag2.height];
  }

  // The alternative should not happen
  else {
    throw new Error('NFA: Fork merge should not happen');
  }

  // Operands
  setOperatorRange(lexemes[token.index], frag1, frag2);

  return newFragment(
    // NFA
    fork,
    [...frag1.terminalNodes, ...frag2.terminalNodes],
    nodes,

    // Operand ranges
    frag1.begin,
    frag2.end,

    // Graph display
    fork,
    [...frag1.terminalGraphNodes, ...frag2.terminalGraphNodes],
    frag1.height + frag2.height
  );
};

//------------------------------------------------------------------------------
// Repeat a fragment 0 to 1 times

const repeat01 = (frag, token, lexemes) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  setOperatorRange(lexemes[token.index], frag);

  setQuantifier(frag, '?');

  return newFragment(
    // NFA
    fork,
    [...frag.terminalNodes, fork],
    [fork, ...frag.nodes],

    // Operand ranges
    frag.begin,
    token.index,

    // Graph display
    frag.firstGraphNode,
    frag.terminalGraphNodes,
    frag.height
  );
};

//------------------------------------------------------------------------------
// Repeat a fragment 0 to N times

const repeat0N = (frag, token, lexemes) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setOperatorRange(lexemes[token.index], frag);

  setQuantifier(frag, '*');

  return newFragment(
    // NFA
    fork,
    [fork],
    [fork, ...frag.nodes],

    // Operand ranges
    frag.begin,
    token.index,

    // Graph display
    frag.firstGraphNode,
    frag.terminalGraphNodes,
    frag.height
  );
};

//------------------------------------------------------------------------------
// Repeat a fragment 1 to N times

const repeat1N = (frag, token, lexemes) => {
  const fork = newNode(token);
  connect(fork, frag.firstNode);
  connectFragment(frag, fork);
  setOperatorRange(lexemes[token.index], frag);

  setQuantifier(frag, '+');

  return newFragment(
    // NFA
    frag.firstNode,
    [fork],
    [...frag.nodes, fork],

    // Operand ranges
    frag.begin,
    token.index,

    // Graph display
    frag.firstGraphNode,
    frag.terminalGraphNodes,
    frag.height
  );
};
//------------------------------------------------------------------------------
// Enclose a fragment in parentheses

const parentheses = (frag, token) => {
  const open = newNode(token);
  const close = newNode(token, { label: ')', type: ')', index: open.end });
  connect(open, frag.firstNode);
  connectFragment(frag, close);

  graphLink(open, frag.firstGraphNode);
  graphMerge(frag.terminalGraphNodes, close);
  open.close = close;

  return newFragment(
    // NFA
    open,
    [close],
    [open, ...frag.nodes, close],

    // Operand ranges
    token.index,
    token.end,

    // Graph display
    open,
    [close],
    frag.height
  );
};

//------------------------------------------------------------------------------
// Create a value node and push it on the fragment stack

const pushValue = (fragments, token) => {
  const node = newNode(token);
  const end = token.end || token.index; // in case of bracket expressions

  const fragment = newFragment(
    // NFA
    node,
    [node],
    [node],

    // Operand ranges
    token.index,
    end,

    // Graph display
    node,
    [node],
    HEIGHT
  );

  fragments.push(fragment);
};

//------------------------------------------------------------------------------
// Apply unary and binary operations to the fragement stack

const unary = (fragments, operation, token, lexemes) => {
  const frag = fragments.pop();
  fragments.push(operation(frag, token, lexemes));
};

const binary = (fragments, operation, token, lexemes) => {
  const frag2 = fragments.pop();
  const frag1 = fragments.pop();
  fragments.push(operation(frag1, frag2, token, lexemes));
};

//------------------------------------------------------------------------------
// Build a NFA from the RPN list of tokens

const buildNFA = (rpn, lexemes) => {
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
      case '?':
        unary(fragments, repeat01, token, lexemes);
        break;
      case '*':
        unary(fragments, repeat0N, token, lexemes);
        break;
      case '+':
        unary(fragments, repeat1N, token, lexemes);
        break;
      case '|':
        binary(fragments, alternate, token, lexemes);
        break;
      case '(':
        unary(fragments, parentheses, token, lexemes);
        break;
      case '~':
        binary(fragments, concat);
        break;
      default:
        break;
    }
  });

  // In case of empty regex
  if (fragments.length === 2) {
    binary(fragments, concat);
  }

  pushValue(fragments, { label: '>', type: 'last' });
  binary(fragments, concat);

  const nfa = fragments[0].nodes;

  nfa.forEach((node, index) => (node.nodeIndex = index));

  return nfa;
};

//------------------------------------------------------------------------------

export default buildNFA;
