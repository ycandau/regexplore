import { useState } from 'react';

import Editor from './Editor';
import Info from './Info';
import Parser from '../re/re_parser';

//------------------------------------------------------------------------------

// A higher level component where the parser state is kept

const Container = () => {
  console.log('Render: Container');

  const [regex, setRegex] = useState('a(b|c)d');

  const parser = new Parser(regex);
  parser.generateRPN();

  const onChange = (str) => {
    setRegex(() => setRegex(str));
  };

  const interpretations = parserOutput;

  return (
    <>
      <h2>Container</h2>
      <Editor
        value={regex}
        interpretations={interpretations}
        onChange={onChange}
      />
      <Info info={'some information'} />
    </>
  );
};

export default Container;

//------------------------------------------------------------------------------

const parserOutput = [
  {
    label: 'a',
    type: 'value',
    pos: 0,
  },
  {
    label: '(',
    type: 'delimiter',
    pos: 1,
    begin: 1,
    end: 5,
  },

  {
    label: 'b',
    type: 'value',
    pos: 2,
  },
  {
    label: '|',
    type: 'operator',
    pos: 3,
    beginL: 2,
    endL: 2,
    beginR: 4,
    endR: 4,
  },
  {
    label: 'c',
    type: 'value',
    pos: 4,
  },
  {
    label: ')',
    type: 'delimiter',
    pos: 5,
    begin: 1,
    end: 5,
  },
  {
    label: 'd',
    type: 'value',
    pos: 6,
  },
];
