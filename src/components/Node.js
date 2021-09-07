const Node = ({ coord, label, diameter, classes, runClasses }) => {
  const style = {
    left: `${coord[0] - diameter / 2}px`,
    top: `${coord[1] - diameter / 2}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  const allClasses = `node ${classes} ${runClasses}`;

  return (
    <div className={allClasses} style={style}>
      {label}
    </div>
  );
};

export default Node;
