import TextField from '@material-ui/core/TextField';

export default function TestStrField({ numRows, string, setString }) {
  const handleChange = (e) => setString(e.target.value);

  return (
    <TextField
      id="testStringField"
      label="Test String"
      multiline
      variant="filled"
      onChange={handleChange}
      fullWidth
      value={string}
      minRows={numRows}
    />
  );
}
