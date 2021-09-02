import TextField from '@material-ui/core/TextField';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

// ghost input magic happens here
const useStyles = makeStyles((theme) => ({
  contextWrapper: {
    display: 'block',
    position: 'relative',
  },
  textBox: {
    '& [class*="MuiInputBase-root"]': {
      color: 'transparent',
      'caret-color': theme.palette.text.primary,
      letterSpacing: 'normal',
      lineHeight: 'normal',
    },
  },
  pap: {
    position: 'absolute',
    width: `calc(100% + ${theme.spacing(4)}px)`,
    minHeight: `calc(100% + ${theme.spacing(4)}px)`,
    margin: theme.spacing(-2),
    paddingTop: theme.spacing(4.3),
    paddingInline: theme.spacing(3.7),
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

export default function TestStrField({
  numRows,
  string,
  setString,
  highlights,
}) {
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
    <div className={classes.contextWrapper}>
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
