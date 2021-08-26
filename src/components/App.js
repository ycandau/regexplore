import { useState } from 'react';

import './App.css';

import { Parser } from '../re/re';

import ReSearchExpression from './ReSearchExpression';
import Display from './Display';

//------------------------------------------------------------------------------

const App = () => {
  const [fragment, setFragment] = useState({});
  // const reString = 'a(b|c)+ef*g';
  const reString = '[^]a-e246-]';

  const parser = new Parser(reString);
  parser.readBracketExpression();
  // console.log(parser, parser.parsed);

  const onHover = (src) => {
    setFragment(() => src);
  };

  const onHoverOff = (src) => {
    setFragment(() => 'Empty');
  };

  return (
    <>
      <ReSearchExpression
        reString={reString}
        i={fragment.index}
        onHover={onHover}
        onHoverOff={onHoverOff}
      />
      <Display info={fragment} />
    </>
  );
};

export default App;
