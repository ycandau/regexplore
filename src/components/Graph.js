import { useState, useRef, useEffect } from 'react';

import { setGen, stepForward, setGraphNodes } from '../re/re_run';

import Node from './Node';

import './Graph.css';

//------------------------------------------------------------------------------
// Display constants

const NODE_DIAM = 40;
const X_MIN = NODE_DIAM * 1.5;
const X_STEP = 60;
const Y_STEP = 60;

const scale = scaleCoord(X_MIN, 400, X_STEP, Y_STEP);

//------------------------------------------------------------------------------

const Graph = ({ nfa, nodes, graph }) => {
  const [step, setStep] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 10, height: 10 });
  const canvasRef = useRef(null);

  //----------------------------------------------------------------------------
  // Drawing hook

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const draw = (ctx) => {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      graph.links.forEach(drawLink(ctx, scale));
      graph.forks.forEach(drawFork(ctx, scale));
      graph.merges.forEach(drawMerge(ctx, scale));
    };

    const handleResize = () => {
      const container = document.querySelector('#graph-container');
      ctx.canvas.width = container.clientWidth;
      ctx.canvas.height = container.clientHeight;
      requestAnimationFrame(() => draw(ctx));
    };

    requestAnimationFrame(() => draw(ctx));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [graph]);

  //----------------------------------------------------------------------------

  setGen(nodes, 0);
  let active = [nfa];

  for (let i = 0; i < step; i++) {
    active = stepForward(active, test[i], i + 1);
  }
  setGraphNodes(graph.nodes, active);

  const onForwardClick = () => {
    setStep(step + 1);
  };

  //----------------------------------------------------------------------------

  return (
    <div id="graph-container">
      {graph.nodes.map(({ coord, label, classes, active }, index) => {
        const scaledCoord = scale(coord);
        return (
          <Node
            key={`${index}`}
            coord={scaledCoord}
            label={label}
            diameter={NODE_DIAM}
            classes={classes}
            active={active}
          />
        );
      })}
      <canvas id="canvas" ref={canvasRef}></canvas>
    </div>
  );
};

export default Graph;

//------------------------------------------------------------------------------

function scaleCoord(xmin, height, dx, dy) {
  return ([x0, y0]) => {
    const x = xmin + x0 * dx;
    const y = height / 2 + y0 * dy;
    return [x, y];
  };
}

const drawLink = (ctx, scale) => (link) => {
  const [p1, p2] = link;
  const [x1, y1] = scale(p1);
  const [x2, y2] = scale(p2);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawCurve = (ctx, scale, p1, p2, p3, forward) => {
  const dx = forward ? -NODE_DIAM / 2 : NODE_DIAM / 2;
  const [x1, y1] = scale(p1);
  const [x3_, y3] = scale(p2);
  const x3 = x3_ + dx;
  const x2 = (x1 + x3) / 2;
  const [x4, y4] = scale(p3);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(x2, y3, x3, y3);
  ctx.lineTo(x4, y4);
  ctx.stroke();
};

const drawFork = (ctx, scale) => (fork) => {
  const [src, ...points] = fork;
  points.forEach((pt) => drawCurve(ctx, scale, src, pt, pt, true));
};

const drawMerge = (ctx, scale) => (merge) => {
  const [dest, ...points] = merge;
  const uMax = points.reduce((max, [x]) => Math.max(x, max), 0);
  points.forEach(([u, v]) =>
    drawCurve(ctx, scale, dest, [uMax, v], [u, v], false)
  );
};
