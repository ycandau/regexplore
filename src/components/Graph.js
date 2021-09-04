import { useRef, useEffect } from 'react';

import './Graph.css';

import Node from './Node';

import Parser from '../re/re_parser';

const scaleNode = (xmin, height, gap, diameter) => (coord) => {
  const x = xmin + coord[0] * (gap + diameter);
  const y = height / 2 + coord[1] * (gap + diameter) - diameter / 2;
  return [x, y];
};

//------------------------------------------------------------------------------

const Graph = () => {
  const parser = new Parser('ab|cdef');
  const { graph } = parser;

  const canvasRef = useRef(null);

  // console.log(graph.links);

  useEffect(() => {
    const scale = scaleNode(40, 300, 50, 40);

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    graph.links.forEach((link) => {
      const [p1, p2] = link;
      const [x1, y1] = scale(p1);
      const [x2, y2] = scale(p2);

      console.log(x1, y1, x2, y2);

      ctx.beginPath();
      ctx.moveTo(x1 + 25, y1 + 25);
      ctx.lineTo(x2 + 25, y2 + 25);
      ctx.stroke();
    });
  }, [graph]);

  const scale = scaleNode(40, 300, 50, 40);

  return (
    <div id="graph-container">
      {graph.nodes.map(({ coord, label }, index) => {
        const scaledCoord = scale(coord);
        return <Node key={`${index}`} coord={scaledCoord} label={label} />;
      })}
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
};

export default Graph;
