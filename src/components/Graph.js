import { useRef, useEffect } from 'react';

import './Graph.css';

import Node from './Node';

import Parser from '../re/re_parser';

const scaleNode = (xmin, height, dx, dy) => (coord) => {
  const x = xmin + coord[0] * dx;
  const y = height / 2 + coord[1] * dy;
  return [x, y];
};

const scale = scaleNode(40, 300, 70, 60);

const drawLink = (ctx) => (link) => {
  const [p1, p2] = link;
  const [x1, y1] = scale(p1);
  const [x2, y2] = scale(p2);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawFork = (ctx) => (fork) => {
  const [src, ...destinations] = fork;
  const [x1, y1] = scale(src);

  destinations.forEach((point) => {
    const [x2, y2] = scale(point);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
};

const drawMerge = (ctx) => (merge) => {
  const [dest, ...sources] = merge;
  const [x3, y3] = scale(dest);

  const xMax = sources.reduce((max, [x]) => Math.max(x, max), 0);
  const [x2] = scale([xMax, 0]);

  sources.forEach((point) => {
    const [x1, y1] = scale(point);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  });
};

//------------------------------------------------------------------------------

const Graph = () => {
  const parser = new Parser('a|(b|c)ccc');
  const { graph } = parser;

  // console.log(graph.forks);
  const canvasRef = useRef(null);

  const diameter = 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    graph.links.forEach(drawLink(ctx));
    graph.forks.forEach(drawFork(ctx));
    graph.merges.forEach(drawMerge(ctx));
  }, [graph]);

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
