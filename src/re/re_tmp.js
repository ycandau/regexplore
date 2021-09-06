// logStr() {
//   logHeading('Input');
//   console.log(`  ${this.input}`);
// }

// logRPN() {
//   logHeading('Tokens');
//   this.rpn.forEach(inspect());
// }

// logDescriptions() {
//   logHeading('Descriptions');
//   this.descriptions.forEach(inspect());
// }

// logWarnings() {
//   logHeading('Warnings');
//   this.warnings.forEach((warning) => console.log(`  ${toString(warning)}`));
// }

// logNFA() {
//   logHeading('NFA');
//   this.nfa.forEach((node) => {
//     const toLabel = (n) => `[${n.label}]`;
//     const next = node.nextNodes.map(toLabel).join(' ');
//     const previous = node.previousNodes.map(toLabel).join(' ');
//     const heights = node.heights ? ` - ${node.heights}` : '';
//     const str = `  ${node.label} : ${previous} - ${next}${heights}`;
//     console.log(str);
//   });
// }

// logGNodes() {
//   logHeading('GNodes');
//   this.gnodes.forEach((gnode) => {
//     const previous = gnode.previous.map((gn) => gn.label).join(' , ');
//     const forkIndex = gnode.forkIndex
//       ? ` - i: ${gnode.forkIndex}`
//       : ' - i: _';
//     const str = `  ${gnode.label} : [ ${previous} ]` + forkIndex;
//     console.log(str);
//   });
// }

// logGraph() {
//   logHeading('Graph');
//   this.graph.nodes.forEach((node) => {
//     const str = `  ${node.label} : ( ${node.x} , ${node.y} )`;
//     console.log(str);
//   });
// }

// logAll() {
//   this.logStr();
//   // this.logRPN();
//   // this.logDescriptions();
//   // this.logWarnings();
//   // this.logNFA();
//   this.logGNodes();
// }
