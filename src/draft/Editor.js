import './Editor.css';

import { useState, useRef } from 'react';

//------------------------------------------------------------------------------

const Editor = ({ value, interpretations }) => {
  const [str, setStr] = useState(value);
  const [index, setIndex] = useState(-1);
  const edit = useRef(null);

  // console.log('Render: Editor', index);

  const onChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    setStr(() => event.target.value);
  };

  const onClick = (index) => (event) => {
    const ind = index === null ? str.length : index;
    event.stopPropagation();
    edit.current.focus();
    edit.current.setSelectionRange(ind, ind);
  };

  const interp = getInterpretations(interpretations, index);

  return (
    <div id="editor">
      <textarea
        ref={edit}
        className="edit"
        spellCheck="false"
        maxLength="40"
        onChange={onChange}
        value={str}
      />
      <div className="display" onClick={onClick(null)}>
        {interp.map((token, index) => {
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

const addClassTo = (interpretations) => (cls, ...indexes) => {
  const begin = indexes[0];
  const end = indexes[1] || indexes[0];
  for (let i = begin; i <= end; i++) {
    const interpretation = interpretations[i] || {};
    interpretation.classes += ` ${cls}`;
  }
};

const getInterpretations = (pOutput, index) => {
  const interpretations = pOutput.map(({ label, type }) => ({
    label,
    classes: type,
  }));

  const token = pOutput[index] || {};
  const add = addClassTo(interpretations);

  switch (token.type) {
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
  return interpretations;
};
