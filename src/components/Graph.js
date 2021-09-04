import { useRef, useEffect } from 'react';

import './Graph.css';

import Node from './Node';

import Parser from '../re/re_parser';

//------------------------------------------------------------------------------

const Graph = () => {
  const canvasRef = useRef(null);

  // const parser = new Parser('(a)|b|(c)*|d');
  const parser = new Parser('a|b*');
  const { graph } = parser;

  const diameter = 40;
  const scale = scaleNode(40, 300, 70, 60);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    graph.links.forEach(drawLink(ctx, scale));
    graph.forks.forEach(drawFork(ctx, scale));
    graph.merges.forEach(drawMerge(ctx, scale));
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

//------------------------------------------------------------------------------

const scaleNode = (xmin, height, dx, dy) => ([x0, y0]) => {
  const x = xmin + x0 * dx;
  const y = height / 2 + y0 * dy;
  return [x, y];
};

const drawLink = (ctx, scale) => (link) => {
  const [p1, p2] = link;
  const [x1, y1] = scale(p1);
  const [x2, y2] = scale(p2);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawFork = (ctx, scale) => (fork) => {
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

const drawMerge = (ctx, scale) => (merge) => {
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
