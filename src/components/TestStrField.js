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
  const handleChange = (event) => setTestString(event.target.value);
  const classes = useStyles();

  //----------------------------------------------------------------------------

  const tokens = testString.split('').map((ch, key) => ({ ch, key }));

  const matches = matchRanges.map(([begin, end]) =>
    highlight(begin, end, 'match')
  );

  addClass(
    tokens,
    highlight(testRange[0], testRange[1], 'test'),
    highlight(testRange[1], testRange[1] + 1, 'current'),
    ...matches
  );

  const spans = tokens.map(({ ch, key, classes }) => (
    <span key={key} className={classes}>
      {ch}
    </span>
  ));

  //----------------------------------------------------------------------------

  return (
    <div className={classes.contextWrapper}>
      <Paper className={classes.pap} elevation={0}>
        <Typography className={classes.ghostText}>{spans}</Typography>
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

//------------------------------------------------------------------------------

const highlight = (begin, end, type) => ({ begin, end, type });

const addClass = (tokens, ...highlights) => {
  highlights.forEach(({ begin, end, type }) => {
    for (let index = begin; index <= end; index++) {
      tokens[index].classes = type;
    }
  });
};
