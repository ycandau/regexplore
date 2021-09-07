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

const stepForward = (nfaNodes, activeNodes, ch) => {
  nfaNodes.forEach((node) => (node.visited = false));
  const nextActiveNodes = [];
  activeNodes.forEach((node) => {
    getNextActiveNodes(node, nextActiveNodes, ch);
  });

  nfaNodes.forEach((node) => (node.visited = false));
  let matchingNode = null;
  for (const node of nextActiveNodes) {
    if (reachesLastNode(node)) {
      matchingNode = node;
      break;
    }
  }
  if (matchingNode) {
    return { runState: 'success', activeNodes: [matchingNode] };
  }

  const runState = nextActiveNodes.length !== 0 ? 'running' : 'failure';
  return { runState, activeNodes: nextActiveNodes };
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
