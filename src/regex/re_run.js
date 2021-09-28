//------------------------------------------------------------------------------
// Run the regex using the NFA
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Propagate forward through non value nodes and gather the list of value nodes
// to test on the next step.

const propagate = (node, nextNodesToTest, visited) => {
  // Already visited
  if (visited[node.nodeIndex]) return false;
  visited[node.nodeIndex] = true;

  // Reached the last node
  if (node.type === 'last') return true;

  // Non value node
  if (!node.match) {
    for (const next of node.nextNodes) {
      const reachedLast = propagate(next, nextNodesToTest, visited);
      if (reachedLast) return true;
    }
    return false;
  }

  // Value node
  nextNodesToTest.push(node);
  return false;
};

//------------------------------------------------------------------------------
// Step forward, testing the current list of value nodes and propagating
// through non value nodes

const stepForward = (currentNodes, testString, pos) => {
  const ch = testString[pos];
  const nextNodesToTest = [];
  const matchingNodes = [];
  const visited = [];

  // Test the current list of value nodes
  for (const node of currentNodes) {
    if (node.match(ch)) {
      matchingNodes.push(node);
      const reachedLast = propagate(
        node.nextNodes[0],
        nextNodesToTest,
        visited
      );

      // Successful match
      if (reachedLast) {
        return {
          runState: 'success',
          matchingNodes: [node],
          nextNodesToTest: [],
        };
      }
    }
  }

  // Failure to match
  if (matchingNodes.length === 0) {
    return { runState: 'failure', matchingNodes, nextNodesToTest };
  }

  // End of test string
  if (pos === testString.length - 1) {
    return { runState: 'endOfString', matchingNodes, nextNodesToTest };
  }

  // Continue running
  return { runState: 'running', matchingNodes, nextNodesToTest };
};

//------------------------------------------------------------------------------
// Initialize the NFA

const initNFA = (nfa) => () => {
  const nextNodesToTest = [];
  const visited = [];
  propagate(nfa[0], nextNodesToTest, visited);
  return { runState: 'starting', matchingNodes: [nfa[0]], nextNodesToTest };
};

//------------------------------------------------------------------------------

const setMatchingGraphNodes = (graphNodes, matchingNodes, runState) => {
  graphNodes.forEach((node) => (node.runClasses = ''));

  matchingNodes.forEach((node) => {
    graphNodes[node.graphNodeIndex].runClasses = 'active';
  });

  graphNodes[graphNodes.length - 1].runClasses += ` ${runState}`;
};

//------------------------------------------------------------------------------

export { initNFA, stepForward, setMatchingGraphNodes };
