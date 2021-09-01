import './Editor.css';

import { useState, useRef } from 'react';

//------------------------------------------------------------------------------

const Editor = ({ editorInfo, onRegexChange }) => {
  const [index, setIndex] = useState(null);
  const edit = useRef(null);

  // Concatenate the regex from the editor info object
  const regex = editorInfo.reduce((str, { label }) => str + label, '');

  // Catch the click events from the display <div> and <span>
  // Then trigger focus and cursor position in the <textarea>
  const onClick = (index) => (event) => {
    const pos = index === null ? regex.length : getPosition(editorInfo, index);

    event.stopPropagation(); // avoid duplicates from <div> and <span>
    edit.current.focus();
    edit.current.setSelectionRange(pos, pos);
  };

  // Generate an array of objects:
  // [ { label: 'a', classes: '...' }, ... ]
  const labelsAndClasses = getLabelsAndClasses(editorInfo, index);

  return (
    <div id="editor">
      <textarea
        ref={edit}
        className="edit"
        spellCheck="false"
        maxLength="40"
        onChange={onRegexChange}
        value={regex}
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

//------------------------------------------------------------------------------

export default Editor;

//------------------------------------------------------------------------------

const getPosition = (editorInfo, index) => {
  let pos = 0;
  for (let i = 0; i <= index; i++) {
    pos += editorInfo[i].label.length;
  }
  return pos;
};

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
      add('hl-value', token.index);
      break;
    case 'value-special':
      add('hl-value-special', token.index);
      break;
    case 'operator':
      add('hl-operator', token.index);
      add('hl-oper-left-inside', token.beginL, token.endL);
      add('hl-oper-right-inside', token.beginR, token.endR);
      break;
    case 'quantifier':
      // console.log(token);
      add('hl-quantifier', token.index);
      add('hl-oper-left-inside', token.beginL, token.endL);
      break;
    case 'delimiter':
      add('hl-delimiter', token.begin);
      add('hl-delimiter', token.end);
      add('hl-delim-inside', token.begin + 1, token.end - 1);
      break;
    default:
      break;
  }
  return displayInfo;
};
