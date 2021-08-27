import { useState } from 'react';

import './App.css';

import Parser from '../re/re';
import descriptions from '../re/re_descriptions';

import ReSearchExpression from './ReSearchExpression';
import Display from './Display';

//------------------------------------------------------------------------------

const App = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  // const reString = 'a(b|c)+ef*g';
  const reString = '[^]a-e246-]';

  const parser = new Parser(reString);
  parser.generateRPN();

  const hoverId =
    hoverIndex !== null ? parser.descriptions[hoverIndex].id : 'empty';
  const info = { ...parser.descriptions[hoverIndex], ...descriptions[hoverId] };

  const onHover = (index) => {
    setHoverIndex(() => index);
  };

  const onHoverOff = (src) => {
    setHoverIndex(() => null);
  };

  return (
    <>
      <ReSearchExpression
        descriptions={parser.descriptions}
        hoverIndex={hoverIndex}
        onHover={onHover}
        onHoverOff={onHoverOff}
      />
      <Display info={info} />
    </>
  );
};

export default App;
