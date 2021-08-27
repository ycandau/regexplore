import './ReSearchExpression.css';

//------------------------------------------------------------------------------

const ReSearchExpression = ({
  descriptions,
  hoverIndex,
  onHover,
  onHoverOff,
}) => {
  // console.log('[ReSearchExpression]: new render');

  return (
    <div className="re_string">
      {descriptions.map((description, index) => (
        <div
          key={index}
          className={`re_char ${index === hoverIndex ? 'highlight' : ''}`}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHoverOff()}
        >
          {description.label}
        </div>
      ))}
    </div>
  );
};

export default ReSearchExpression;
