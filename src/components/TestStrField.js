import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

export default function TestStrField({
  numRows,
  widthRems,
  string,
  setString,
  highlights,
}) {
  const useStyles = makeStyles((theme) => ({
    textBox: {
      '& [class*="MuiInputBase-root"]': {
        color: 'transparent',
        'caret-color': '#666',
      },
    },
    pap: {
      position: 'absolute',
      width: widthRems * 0.925 + 'rem',
      height: numRows * 1.19 + 'rem',
      padding: theme.spacing(4),
      marginLeft: theme.spacing(-2),
      marginTop: theme.spacing(-2),
    },
    ghostText: {
      lineHeight: 'unset',
      letterSpacing: 'unset',
    },
  }));
  const handleChange = (e) => setString(e.target.value);
  const classes = useStyles();

  return (
    <>
      <Paper className={classes.pap}>
        <Typography className={classes.ghostText}>{string}</Typography>
      </Paper>
      <TextField
        classes={{
          root: classes.textBox,
        }}
        id="testStringField"
        label="Test String"
        multiline
        variant="outlined"
        onChange={handleChange}
        fullWidth
        value={string}
        minRows={numRows}
        spellCheck="false"
      />
    </>
  );
}
/* 
args: {
  ...highlights: [
      { ind: [2, 4], token: 'match' },
      { ind: [6, 7], token: 'cursor' },
    ],
  }
 */
