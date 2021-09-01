import { useState } from 'react';

import Editor from './Editor';
import Info from './Info';
import Parser from '../re/re_parser';

//------------------------------------------------------------------------------

// A higher level component where the parser state is kept

const Container = () => {
  const [regex, setRegex] = useState('a(b|c)d');

  const parser = new Parser(regex);

  const onRegexChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    setRegex(() => event.target.value);
  };

  return (
    <>
      <h2>Container</h2>
      <Editor editorInfo={parser.editorInfo} onRegexChange={onRegexChange} />
      <Info info={'some information'} />
    </>
  );
};

//------------------------------------------------------------------------------

export default Container;
