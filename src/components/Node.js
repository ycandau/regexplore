const Node = ({ coord, label, diameter, classes }) => {
  const style = {
    left: `${coord[0] - diameter / 2}px`,
    top: `${coord[1] - diameter / 2}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
  };

  return (
    <div className={`node ${classes}`} style={style}>
      {label}
    </div>
  );
};

export default Node;
