const Node = ({ coord, label, diameter }) => {
  const style = {
    left: `${coord[0] - diameter / 2}px`,
    top: `${coord[1] - diameter / 2}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  return (
    <div className="node" style={style}>
      {label}
    </div>
  );
};

export default Node;
