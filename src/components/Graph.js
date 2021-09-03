import './Graph.css';

import Node from './Node';

import Parser from '../re/re_parser';

const scaleNode = (xmin, height, gap, diameter) => (node) => {
  const x = xmin + node.x * (gap + diameter);
  const y = height / 2 + node.y * (gap + diameter) - diameter / 2;
  return { label: node.label, x, y };
};

//------------------------------------------------------------------------------

const Graph = () => {
  const parser = new Parser('a|(b|(c|d))');
  const { graph } = parser;

  const scale = scaleNode(40, 300, 50, 40);

  return (
    <div id="graph-container">
      {graph.nodes.map((node, index) => {
        const props = scale(node);
        return <Node key={`${index}`} {...props} />;
      })}
    </div>
  );
};

export default Graph;
