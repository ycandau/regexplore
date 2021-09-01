import { useState } from 'react';

import Editor from './Editor';
import Parser from '../re/re_parser';

//------------------------------------------------------------------------------

// A higher level component where the parser state is kept

const Container = () => {
  console.log('Render: Container');

  const [regex, setRegex] = useState('a(b|c)d');

  const parser = new Parser(regex);
  parser.generateRPN();

  const onRegexChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    setRegex(() => setRegex(event.target.value));
  };

  const editorInfo = parserOutput;

  return <Editor editorInfo={editorInfo} onRegexChange={onRegexChange} />;
};

export default Container;

//------------------------------------------------------------------------------

const parserOutput = [
  {
    label: 'a',
    displayType: 'value',
    pos: 0,
  },
  {
    label: '(',
    displayType: 'delimiter',
    pos: 1,
    begin: 1,
    end: 5,
  },

  {
    label: 'b',
    displayType: 'value',
    pos: 2,
  },
  {
    label: '|',
    displayType: 'operator',
    pos: 3,
    beginL: 2,
    endL: 2,
    beginR: 4,
    endR: 4,
  },
  {
    label: 'c',
    displayType: 'value',
    pos: 4,
  },
  {
    label: ')',
    displayType: 'delimiter',
    pos: 5,
    begin: 1,
    end: 5,
  },
  {
    label: 'd',
    displayType: 'value',
    pos: 6,
  },
];
