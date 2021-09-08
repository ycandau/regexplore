const Node = ({ coord, label, quantifier, classes, runClasses, diameter }) => {
  const style = {
    left: `${coord[0] - diameter / 2}px`,
    top: `${coord[1] - diameter / 2}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  const quantStyle = {
    left: `${coord[0] + diameter * 0.5}px`,
    top: `${coord[1] - diameter * 0.8}px`,
  };

  const allClasses = `node ${classes} ${runClasses}`;
  const tag = quantifier && quantifier !== 'open';

  return (
    <>
      <div className={allClasses} style={style}>
        {label}
      </div>
      {tag && (
        <div className={'quant-tag'} style={quantStyle}>
          {quantifier}
        </div>
      )}
    </>
  );
};

export default Node;
