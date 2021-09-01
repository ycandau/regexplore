import TextField from '@material-ui/core/TextField';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

export default function TestStrField({
  numRows,
  widthRems,
  string,
  setString,
  highlights,
}) {
  // ghost input magic happens here
  const useStyles = makeStyles((theme) => ({
    textBox: {
      '& [class*="MuiInputBase-root"]': {
        color: 'transparent',
        'caret-color': '#666',
        letterSpacing: 'normal',
        lineHeight: 'normal',
      },
    },
    pap: {
      position: 'absolute',
      width: widthRems + 'rem',
      minHeight: numRows * 1.85 + 'rem',
      padding: theme.spacing(4),
      paddingTop: theme.spacing(4.3),
      paddingLeft: theme.spacing(3.7),
      marginLeft: theme.spacing(-2),
      marginTop: theme.spacing(-2),
    },
    ghostText: {
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    match: {
      backgroundColor: alpha(theme.palette.success.main, 0.5),
    },
    cursor: {
      backgroundColor: alpha(theme.palette.info.main, 0.5),
    },
  }));
  const handleChange = (e) => setString(e.target.value);
  const classes = useStyles();

  /**
   * experimental highlighting module, potentially reusable
   */
  // go over the array of highlights with the string as a starting value
  const highlightedStr = highlights.reduce(
    (a, { startInd, endInd, token }) =>
      a.map((c, i) => {
        let clName;
        // if the character matches the highlight..
        if (i >= startInd && i < endInd) clName = token;
        return (
          // ..wrap it in a span with the appropriate class name
          <span key={i} className={classes[clName]}>
            {c}
          </span>
        );
      }),
    // take the string as a starting value, split for processing
    string.split('')
  );

  return (
    <div>
      <Paper className={classes.pap}>
        <Typography className={classes.ghostText}>{highlightedStr}</Typography>
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
    </div>
  );
}
