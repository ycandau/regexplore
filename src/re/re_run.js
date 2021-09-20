//------------------------------------------------------------------------------
// Run the regex using the NFA
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Propagate forward through non value nodes and gather the list of value nodes
// to test on the next step.

const propagate = (node, nextNodesToTest, gen) => {
  // Already visited
  if (node.gen === gen) return false;
  node.gen = gen;

  // Reached the last node
  if (node.type === 'last') return true;

  // Non value node
  if (!node.match) {
    for (const next of node.nextNodes) {
      const reachedLast = propagate(next, nextNodesToTest, gen);
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
  const gen = currentNodes[0].gen + 1;

  const nextNodesToTest = [];
  const matchingNodes = [];

  // Test the current list of value nodes
  for (const node of currentNodes) {
    if (node.match(ch)) {
      matchingNodes.push(node);
      const reachedLast = propagate(node.nextNodes[0], nextNodesToTest, gen);

      // Successful match
      if (reachedLast) {
        return { runState: 'success', matchingNodes: [node], nextNodesToTest };
      }
    }
  }

  // End of test string
  if (pos === testString.length - 1) {
    return { runState: 'end', matchingNodes, nextNodesToTest };
  }

  // Failure to match
  if (matchingNodes.length === 0) {
    return { runState: 'failure', matchingNodes, nextNodesToTest };
  }

  // Continue running
  return { runState: 'running', matchingNodes, nextNodesToTest };
};

//------------------------------------------------------------------------------
// Initialize the NFA

const initNFA = (nfa) => {
  const nextNodesToTest = [];
  propagate(nfa[0], nextNodesToTest, 0);

  return nextNodesToTest;
};

//------------------------------------------------------------------------------

const setActiveGraphNodes = (graphNodes, matchingNodes, runState) => {
  graphNodes.forEach((node) => (node.runClasses = ''));

  matchingNodes.forEach((node) => {
    graphNodes[node.graphNodeIndex].runClasses = 'active';
  });

  graphNodes[graphNodes.length - 1].runClasses += ` ${runState}`;
};

//------------------------------------------------------------------------------

export { stepForward, setActiveGraphNodes };
