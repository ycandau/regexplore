import Paper from '@material-ui/core/Paper';

export default function TestStrDiv({ ref, str }) {
  return <Paper children={str} ref={ref} contentEditable />;
}
