import TextField from '@material-ui/core/TextField';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import {
  green,
  blue,
  yellow,
  orange,
  purple,
  red,
} from '@material-ui/core/colors';
// import { useState } from 'react';

export default function RegexEditor({ widthRems, tokens, setTokens }) {
  // const [x, setX] = useState(null);
  // const [y, setY] = useState(null);

  // ghost input magic happens here
  const useStyles = makeStyles((theme) => ({
    textBox: {
      '& [class*="MuiInputBase-root"]': {
        color: 'transparent',
        'caret-color': '#888',
        letterSpacing: 'normal',
        liteHeight: 'normal',
        fontFamily: 'Fira Mono',
        fontWeight: 'bold',
      },
    },
    pap: {
      position: 'absolute',
      width: widthRems * 0.925 + 'rem',
      minHeight: 1.19 + 'rem',
      padding: theme.spacing(4),
      paddingTop: theme.spacing(4.1),
      paddingLeft: theme.spacing(3.75),
      marginLeft: theme.spacing(-2),
      marginTop: theme.spacing(-2),
    },
    ghostText: {
      lineHeight: 'normal',
      letterSpacing: 'normal',
      fontFamily: 'Fira Mono',
      fontWeight: 'bold',
    },
    match: {
      backgroundColor: alpha(theme.palette.success.main, 0.5),
    },
    cursor: {
      backgroundColor: alpha(theme.palette.info.main, 0.5),
    },
    value: {
      color: green[theme.palette.type === 'dark' ? 'A200' : '700'],
    },
    // this is bad, really-really bad
    // 'hl-value': {
    //   backgroundColor: x > 24 && x <= 36 && y > 16 && y <= 46 && green[700],
    // },
    'value-special': {
      color: blue[theme.palette.type === 'dark' ? 'A200' : '800'],
    },
    operator: {
      color: theme.palette.custom.orange,
    },
    quantifier: {
      color: theme.palette.custom.orange,
    },
    delimeter: {
      color: purple[theme.palette.type === 'dark' ? 'A200' : '400'],
    },
    error: {
      color: red[theme.palette.type === 'dark' ? 'A200' : '700'],
    },
  }));
  const handleChange = (e) => setTokens(e.target.value);
  const classes = useStyles();

  // another experimental highlighting module
  const highlightedStr = tokens.map(({ label, colorType, hoverType }, i) => (
    <span
      key={i}
      className={[classes[colorType], classes[hoverType]].join(' ')}
    >
      {label}
    </span>
  ));
  // value for the controlled input
  const string = tokens.map(({ label }) => label).join('');

  // /**
  //  * experimental highlighting module, potentially reusable
  //  */
  // // go over the array of highlights with the string as a starting value
  // const highlightedStr = highlights.reduce(
  //   (a, { startInd, endInd, token }) =>
  //     a.map((c, i) => {
  //       let clName;
  //       // if the character matches the highlight..
  //       if (i >= startInd && i < endInd) clName = token;
  //       return (
  //         // ..wrap it in a span with the appropriate class name
  //         <span key={i} className={classes[clName]}>
  //           {c}
  //         </span>
  //       );
  //     }),
  //   // take the string as a starting value, split for processing
  //   string.split('')
  // );

  return (
    <div>
      <Paper className={classes.pap}>
        <Typography className={classes.ghostText}>{highlightedStr}</Typography>
      </Paper>
      <TextField
        classes={{
          root: classes.textBox,
        }}
        id="regexEditorBox"
        label="Regex"
        variant="outlined"
        onChange={handleChange}
        fullWidth
        value={string}
        spellCheck="false"
        // pixel-tracking version of the hover highlighting, no bueno
        // onMouseMove={({ nativeEvent }) => {
        //   const { offsetX, offsetY } = nativeEvent;
        //   setX(offsetX);
        //   setY(offsetY);
        // }}
      />
    </div>
  );
}
