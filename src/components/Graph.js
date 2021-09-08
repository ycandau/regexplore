import { useRef, useEffect } from 'react';
// import { makeStyles } from '@material-ui/core';

import { setActiveGraphNodes } from '../re/re_run';

import Node from './Node';

import './Graph.css';

// const useStyles = makeStyles((theme) => ({
//   links: {
//     color: theme.palette.primary.contrastText,
//   }
//  }));

//------------------------------------------------------------------------------
// Display constants

const NODE_DIAM = 40;
const X_MIN = NODE_DIAM * 1.5;
const X_STEP = 60;
const Y_STEP = 60;

const scale = scaleCoord(X_MIN, 475, X_STEP, Y_STEP);

//------------------------------------------------------------------------------

const Graph = ({ graph, activeNodes, runState }) => {
  const canvasRef = useRef(null);

  //----------------------------------------------------------------------------
  // Drawing hook

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const draw = (ctx) => {
      ctx.strokeStyle = '#006020';
      ctx.lineWidth = 2;
      graph.links.forEach(drawLink(ctx, scale));
      graph.forks.forEach(drawFork(ctx, scale));
      graph.merges.forEach(drawMerge(ctx, scale));
      graph.parentheses.forEach(drawParentheses(ctx, scale));
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

  setActiveGraphNodes(graph.nodes, activeNodes, runState);

  //----------------------------------------------------------------------------

  return (
    <div id="graph-container">
      {graph.nodes.map(
        ({ coord, label, quantifier, classes, runClasses }, index) => {
          const scaledCoord = scale(coord);
          return (
            <Node
              key={`${index}`}
              coord={scaledCoord}
              label={label}
              quantifier={quantifier}
              classes={classes}
              runClasses={runClasses}
              diameter={NODE_DIAM}
            />
          );
        }
      )}
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

const drawParentheses = (ctx, scale) => (paren) => {
  const [open, close] = paren;
  const [x1, y1] = scale(open);
  const [x2] = scale(close);

  // Background
  ctx.fillStyle = 'rgba(0, 206, 209, 0.08)';
  ctx.fillRect(x1, y1 - NODE_DIAM * 0.5, x2 - x1, NODE_DIAM);

  // Borders
  ctx.strokeStyle = 'rgba(0, 206, 209, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.rect(x1, y1 - NODE_DIAM * 0.5, x2 - x1, NODE_DIAM);
  ctx.stroke();
};
