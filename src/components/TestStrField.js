import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';

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
  matched: {
    color: theme.palette.custom.green,
    borderBottomColor: theme.palette.custom.green,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  tested: {
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
  success: {
    color: theme.palette.custom.green,
    backgroundColor: theme.palette.action.selected,
    borderBottomColor: theme.palette.custom.green,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  failure: {
    color: theme.palette.custom.red,
    backgroundColor: theme.palette.action.selected,
    borderBottomColor: theme.palette.custom.red,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
}));

//------------------------------------------------------------------------------

const TestStrField = ({
  testString,
  runState,
  testRange,
  matchRanges,
  setTestString,
  numRows,
}) => {
  const classes = useStyles();
  const tokens = testStringTokens(testString, runState, testRange, matchRanges);

  const spans = tokens.map(({ ch, key, type }) => (
    <span key={key} className={classes[type]}>
      {ch}
    </span>
  ));

  return (
    <div className={classes.contextWrapper}>
      <Paper className={classes.pap} elevation={0}>
        <Typography className={classes.ghostText}>{spans}</Typography>
      </Paper>
      <TextField
        classes={{ root: classes.textBox }}
        id="testStringField"
        label="Test String"
        value={testString}
        onChange={(event) => setTestString(event.target.value)}
        minRows={numRows}
        variant="outlined"
        spellCheck="false"
        fullWidth
        multiline
      />
    </div>
  );
};

export default TestStrField;

//------------------------------------------------------------------------------
// Helpers

const addClass = (tokens, begin, end, type) => {
  for (let i = begin; i <= end; i++) {
    tokens[i].type = type;
  }
};

const testStringTokens = (testString, runState, testRange, matchRanges) => {
  const tokens = testString.split('').map((ch, key) => ({ ch, key, type: '' }));

  matchRanges.forEach(([begin, end]) =>
    addClass(tokens, begin, end, 'matched')
  );

  const [begin, end] = testRange;
  const tailType = runState === 'success' ? 'success' : 'tested';
  const headType =
    runState === 'success' || runState === 'failure' ? runState : 'current';

  addClass(tokens, begin, end - 1, tailType);
  addClass(tokens, end, end, headType);

  return tokens;
};
