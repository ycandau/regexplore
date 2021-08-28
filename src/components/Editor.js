import './Editor.css';

import { useState } from 'react';

//------------------------------------------------------------------------------

const Editor = ({ test }) => {
  const [str, setStr] = useState('alpha');

  const onChange = (event) => {
    // console.log(event.nativeEvent.inputType);
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    setStr(() => event.target.value);
  };

  return (
    <div id="editor">
      <textarea
        className="edit"
        spellCheck="false"
        maxLength="40"
        onChange={onChange}
        value={str}
      />
      <div className="display">
        {str.split('').map((ch, index) => {
          return <span key={index}>{ch}</span>;
        })}
      </div>
    </div>
  );
};

export default Editor;
