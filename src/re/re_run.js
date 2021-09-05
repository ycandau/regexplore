//------------------------------------------------------------------------------
// Run the NFA
//------------------------------------------------------------------------------

const setGen = (nodes, gen) => nodes.forEach((node) => (node.gen = gen));

const getNextActiveNodes = (node, nextActiveNodes, ch, gen) => {
  node.nextNodes.forEach((next) => {
    console.log(next);
    if (next.gen === gen) return;
    next.gen = gen;

    if (next.match !== undefined) {
      if (next.match(ch)) nextActiveNodes.push(next);
    } else {
      getNextActiveNodes(next, nextActiveNodes, ch, gen);
    }
  });
};

const stepForward = (activeNodes, ch, gen) => {
  const nextActiveNodes = [];
  activeNodes.forEach((node) => {
    getNextActiveNodes(node, nextActiveNodes, ch, gen);
  });
  return nextActiveNodes;
};

const setGraphNodes = (graphNodes, activeNodes) => {
  graphNodes.forEach((gnode) => {
    gnode.active = false;
  });
  activeNodes.forEach((node) => {
    graphNodes[node.graphNodeIndex].active = true;
  });
};

//------------------------------------------------------------------------------

export { setGen, stepForward, setGraphNodes };
