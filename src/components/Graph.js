import { useRef, useEffect } from 'react';

import './Graph.css';

import Node from './Node';

import Parser from '../re/re_parser';

const scaleNode = (xmin, height, dx, dy) => (coord) => {
  const x = xmin + coord[0] * dx;
  const y = height / 2 + coord[1] * dy;
  return [x, y];
};

//------------------------------------------------------------------------------

const Graph = () => {
  const parser = new Parser('a*c');
  const { graph } = parser;

  const canvasRef = useRef(null);
  const scale = scaleNode(40, 300, 70, 60);
  const diameter = 40;

  // console.log(graph);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    graph.links.forEach((link) => {
      const [p1, p2] = link;
      const [x1, y1] = scale(p1);
      const [x2, y2] = scale(p2);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }, [graph, scale]);

  return (
    <div id="graph-container">
      {graph.nodes.map(({ coord, label }, index) => {
        const scaledCoord = scale(coord);
        return (
          <Node
            key={`${index}`}
            coord={scaledCoord}
            label={label}
            diameter={diameter}
          />
        );
      })}
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
};

export default Graph;
