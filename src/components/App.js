import { useState } from 'react';

import './App.css';

import Parser from '../re/re_parser';
import { descriptions } from '../re/re_static_info';

import ReSearchExpression from './ReSearchExpression';
import Display from './Display';
import Editor from './Editor';

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
      <hr />
      <Editor test={'test'} />
    </>
  );
};

export default App;
