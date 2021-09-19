//------------------------------------------------------------------------------
// Compile the regex into a nondeterministic finite automata
//------------------------------------------------------------------------------

const HEIGHT = 1;

//------------------------------------------------------------------------------
// Create node and fragment objects

const newNode = (token, config) => ({ ...token, nextNodes: [], ...config });

const newFragment = (firstNode, terminalNodes, begin, end, height, nodes) => ({
  // To build the NFA
  firstNode, // first node in the fragment
  terminalNodes, // array of terminal nodes
  nodes, // an ordered array of nodes

  // To track operands
  begin, // index of the first node in the fragment
  end, // index of the last node in the fragment

  // To build the graph display
  firstGraphNode: 1,
  terminalGraphNodes: 1,
  height, // to calculate the graph layout
});

//------------------------------------------------------------------------------
// Helper functions to connect nodes and fragments

const connect = (node1, node2, index) => {
  node1.nextNodes.push(node2);
  if (index !== undefined) node2.forkIndex = index;
};

const connectFragment = (frag, node) => {
  frag.terminalNodes.forEach((n) => connect(n, node));
};

//------------------------------------------------------------------------------
// Helper function to set the ranges of operator lexemes

const setOperatorRange = (lexeme, frag1, frag2) => {
  lexeme.beginL = frag1.begin;
  lexeme.endL = frag1.end;
  if (frag2 !== undefined) {
    lexeme.beginR = frag2.begin;
    lexeme.endR = frag2.end;
  }
};

//------------------------------------------------------------------------------

const graphLink = (node1, node2) => {
  node2.previousNode = node1;
};

const graphMerge = (nodes, node2) => {
  node2.previousNodes = [...nodes];
};

const setQuantifier = (frag, type) => {
  frag.firstGraphNode.quantifier = type;
};

//------------------------------------------------------------------------------
// Concatenate two fragments

const concat = (frag1, frag2) => {
  connectFragment(frag1, frag2.firstNode);

  //--------------------------------

  if (frag1.terminalGraphNodes) {
    graphMerge(frag1.terminalGraphNodes, frag2.firstGraphNode);
  } else {
    graphLink(frag1.lastGraphNode, frag1.firstGraphNode);
  }

  //--------------------------------

  return newFragment(
    // NFA
    frag1.firstNode,
    [...frag2.terminalNodes],
    [...frag1.nodes, ...frag2.nodes],

    // Operands
    frag1.begin,
    frag2.end,

    // Graph display
    frag1.firstNode,
    frag2.terminalNodes,
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
  }

  // Alternative should not happen
  else {
    throw new Error('NFA: Fork merge should not happen');
  }

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
    [...frag1.terminalNodes, ...frag2.terminalNodes],
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
    frag.firstNode,
    frag.terminalNodes,
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
    frag.firstNode,
    frag.terminalNodes,
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
    frag.firstNode,
    frag.terminalNodes,
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

  open.close = close;
  close.open = close;

  //--------------------------------

  if (frag.terminalGraphNodes) {
    graphLink(open, frag.firstGraphNode);
    graphMerge(frag.terminalGraphNodes, close);
  } else {
    graphLink(open, frag.firstGraphNode);
    graphLink(frag.lastGraphNode, close);
  }

  //--------------------------------

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

  return fragments[0].nodes;
};

//------------------------------------------------------------------------------

export default buildNFA;
