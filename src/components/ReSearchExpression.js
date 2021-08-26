import './ReSearchExpression.css';

//------------------------------------------------------------------------------

const ReSearchExpression = ({ reString, onHover, onHoverOff, i }) => {
  console.log('render');
  return (
    <div className="re_string">
      {reString.split('').map((ch, index) => (
        <div
          key={index}
          className={`re_char ${index === i ? 'highlight' : ''}`}
          onMouseEnter={() => onHover({ ch, index })}
          onMouseLeave={() => onHoverOff(ch)}
        >
          {ch}
        </div>
      ))}
    </div>
  );
};

export default ReSearchExpression;
