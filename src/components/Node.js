const Node = ({ label, x, y }) => {
  const coord = { left: `${x}px`, top: `${y}px` };
  return (
    <div className="node" style={coord}>
      {/* Test */}
      {label}
    </div>
  );
};

export default Node;
