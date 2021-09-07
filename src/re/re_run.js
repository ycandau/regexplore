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

const checkIfMatch = (node) => {
  for (const next of node.nextNodes) {
    if (next.type === 'last') return true;
    if (next.visited || next.match) break;
    next.visited = true;
    if (checkIfMatch(next)) return true;
  }
  return false;
};

const stepForward = (nfaNodes, activeNodes, ch) => {
  nfaNodes.forEach((node) => (node.visited = false));
  const nextActiveNodes = [];
  activeNodes.forEach((node) => {
    getNextActiveNodes(node, nextActiveNodes, ch);
  });

  nfaNodes.forEach((node) => (node.visited = false));
  let matchingNode = null;
  for (const node of nextActiveNodes) {
    if (checkIfMatch(node)) {
      matchingNode = node;
      break;
    }
  }
  return { nextActiveNodes, match: matchingNode };
};

const setActiveGraphNodes = (graphNodes, activeNodes, match) => {
  graphNodes.forEach((gnode) => {
    gnode.active = false;
  });

  activeNodes.forEach((node) => {
    graphNodes[node.graphNodeIndex].active = true;
  });
};

//------------------------------------------------------------------------------

export { stepForward, setActiveGraphNodes };
