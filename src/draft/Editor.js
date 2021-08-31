import './Editor.css';

import { useState, useRef } from 'react';

//------------------------------------------------------------------------------

const Editor = ({ editorInfo, onRegexChange }) => {
  console.log('Render: Editor');

  const [index, setIndex] = useState(null);
  const edit = useRef(null);

  const str = editorInfo.reduce((str, { label }) => str + label, '');

  // const onChange = (event) => {
  //   if (event.nativeEvent.inputType === 'insertLineBreak') return;
  //   // setStr(() => event.target.value);
  // };

  const onClick = (index) => (event) => {
    const ind = index === null ? str.length : index;
    event.stopPropagation();
    edit.current.focus();
    edit.current.setSelectionRange(ind, ind);
  };

  const labelsAndClasses = getLabelsAndClasses(editorInfo, index);

  return (
    <div id="editor">
      <textarea
        ref={edit}
        className="edit"
        spellCheck="false"
        maxLength="40"
        onChange={onRegexChange}
        value={str}
      />
      <div className="display" onClick={onClick(null)}>
        {labelsAndClasses.map((token, index) => {
          return (
            <span
              key={index}
              className={token.classes}
              onMouseEnter={() => setIndex(() => index)}
              onMouseLeave={() => setIndex(() => null)}
              onClick={onClick(index)}
            >
              {token.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Editor;

//------------------------------------------------------------------------------

const addClassTo = (displayInfo) => (cls, ...indexes) => {
  const begin = indexes[0];
  const end = indexes[1] || indexes[0];
  for (let i = begin; i <= end; i++) {
    const token = displayInfo[i] || {};
    token.classes += ` ${cls}`;
  }
};

const getLabelsAndClasses = (editorInfo, index) => {
  const displayInfo = editorInfo.map(({ label, displayType }) => ({
    label,
    classes: displayType,
  }));

  const token = editorInfo[index] || {};
  const add = addClassTo(displayInfo);

  switch (token.displayType) {
    case 'value':
      add('hl-value', token.pos);
      break;
    case 'delimiter':
      add('hl-delimiter', token.begin);
      add('hl-delimiter', token.end);
      add('hl-delimiter-inside', token.begin + 1, token.end - 1);
      break;
    case 'operator':
      add('hl-operator', token.pos);
      add('hl-left-operand-inside', token.beginL, token.endL);
      add('hl-right-operand-inside', token.beginR, token.endR);
      break;
    default:
      break;
  }
  return displayInfo;
};
