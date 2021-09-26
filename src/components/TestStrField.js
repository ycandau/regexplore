import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
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
      fontSize: 20,
    },
  },
  pap: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: `calc(100% + ${theme.spacing(4)}px)`,
    minHeight: `calc(100% + ${theme.spacing(4)}px)`,
    margin: theme.spacing(-2),
    paddingTop: theme.spacing(4.3),
    paddingInline: theme.spacing(3.7),
  },
  ghostText: {
    lineHeight: 'normal',
    letterSpacing: 'normal',
    color: theme.palette.text.secondary,
    fontSize: 20,
  },
  match: {
    color: theme.palette.custom.green,
    borderBottomColor: theme.palette.custom.green,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  test: {
    color: theme.palette.custom.orange,
    borderBottomColor: theme.palette.custom.orange,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  current: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.selected,
    borderBottomColor: theme.palette.text.primary,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
}));

//------------------------------------------------------------------------------

const TestStrField = ({
  testString,
  testRange,
  matchRanges,
  setTestString,
  numRows,
}) => {
  const handleChange = (e) => setTestString(e.target.value);
  const classes = useStyles();

  const current = {
    startInd: testRange[1],
    endInd: testRange[1] + 1,
    type: 'current',
  };
  const test = {
    startInd: testRange[0],
    endInd: testRange[1],
    type: 'test',
  };
  const testStringHighlights = [test, current];

  matchRanges.forEach(([startInd, endInd]) => {
    const match = { startInd, endInd, type: 'match' };
    testStringHighlights.push(match);
  });

  /**
   * experimental highlighting module, potentially reusable
   */
  // go over the array of highlights with the string as a starting value
  const highlightedStr = testStringHighlights.reduce(
    (a, { startInd, endInd, type }) =>
      a.map((c, i) => {
        let clName;
        // if the character matches the highlight..
        if (i >= startInd && i < endInd) clName = type;
        return (
          // ..wrap it in a span with the appropriate class name
          <span key={i} className={classes[clName]}>
            {c}
          </span>
        );
      }),
    // take the string as a starting value, split for processing
    testString ? testString.split('') : []
  );

  return (
    <div className={classes.contextWrapper}>
      <Paper className={classes.pap} elevation={0}>
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
        value={testString}
        minRows={numRows}
        spellCheck="false"
      />
    </div>
  );
};

export default TestStrField;
