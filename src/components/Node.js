const Node = ({ coord, label, diameter, classes, active }) => {
  const style = {
    left: `${coord[0] - diameter / 2}px`,
    top: `${coord[1] - diameter / 2}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  const dynClasses = `node ${classes} ${active ? 'active' : ''}`;

  return (
    <div className={dynClasses} style={style}>
      {label}
    </div>
  );
};

export default Node;
