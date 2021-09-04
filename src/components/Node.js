const Node = ({ coord, label }) => {
  const coordObj = { left: `${coord[0]}px`, top: `${coord[1]}px` };
  return (
    <div className="node" style={coordObj}>
      {/* Test */}
      {label}
    </div>
  );
};

export default Node;
