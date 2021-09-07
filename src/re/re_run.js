//------------------------------------------------------------------------------
// Run the NFA
//------------------------------------------------------------------------------

const getNextActiveNodes = (node, nextActiveNodes, ch) => {
  node.nextNodes.forEach((next) => {
    if (next.visited) return;
    next.visited = true;

    if (next.match !== undefined) {
      if (next.match(ch)) nextActiveNodes.push(next);
    } else {
      getNextActiveNodes(next, nextActiveNodes, ch);
    }
  });
};

const reachesLastNode = (node) => {
  for (const next of node.nextNodes) {
    if (next.type === 'last') return true;
    if (next.visited || next.match) break;
    next.visited = true;
    if (reachesLastNode(next)) return true;
  }
  return false;
};

//------------------------------------------------------------------------------

const stepForward = (nfaNodes, prevActiveNodes, testString, pos) => {
  const ch = testString[pos];

  // Next active nodes
  nfaNodes.forEach((node) => (node.visited = false));
  const activeNodes = [];
  prevActiveNodes.forEach((node) => {
    getNextActiveNodes(node, activeNodes, ch);
  });

  // Check if match in reach
  nfaNodes.forEach((node) => (node.visited = false));
  let matchingNode = null;
  for (const node of activeNodes) {
    if (reachesLastNode(node)) {
      matchingNode = node;
      break;
    }
  }

  // Returns
  if (matchingNode) {
    return { runState: 'success', activeNodes: [matchingNode] };
  }
  if (pos === testString.length - 1) {
    return { runState: 'end', activeNodes };
  }
  if (activeNodes.length === 0) {
    return { runState: 'failure', activeNodes };
  }
  return { runState: 'running', activeNodes };
};

//------------------------------------------------------------------------------

const setActiveGraphNodes = (graphNodes, activeNodes, runState) => {
  graphNodes.forEach((gnode) => {
    gnode.runClasses = '';
  });

  activeNodes.forEach((node) => {
    graphNodes[node.graphNodeIndex].runClasses = 'active';
  });

  graphNodes[graphNodes.length - 1].runClasses += ` ${runState}`;
};

//------------------------------------------------------------------------------

export { stepForward, setActiveGraphNodes };
