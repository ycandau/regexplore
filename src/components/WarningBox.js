import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  warnList: {
    color:
      theme.palette.type === 'dark'
        ? theme.palette.warning.main
        : theme.palette.error.dark,
  },
}));

export default function WarningBox({ warnings, onHover, onFix }) {
  const classes = useStyles();
  const warnList = warnings.map(({ pos, excerpt, issue, msg }) => (
    <ListItem key={pos} button onMouseOver={() => onHover(pos)}>
      <ListItemText
        primary={issue}
        secondary={
          <>
            At position {pos} {excerpt && ", '" + excerpt + "'"} - {msg}
          </>
        }
      />
    </ListItem>
  ));

  return (
    <div>
      <Card className={classes.warnList}>
        <CardContent>
          <CardHeader
            title="Warnings"
            action={
              <Button
                size="large"
                variant="outlined"
                disabled={!warnings.length}
                className={classes.warnList}
                onClick={onFix}
              >
                Fix
              </Button>
            }
          />
          <List dense disablePadding>
            {warnList}
          </List>
        </CardContent>
      </Card>
    </div>
  );
}

//------------------------------------------------------------------------------

// const warningsExample = [
//   {
//     label: '(',
//     pos: 3,
//     index: 3,
//     issue: 'An open parenthesis has not been closed.',
//     msg:
//       'The parser is adding an implicit closing parenthesis to correct the regex.',
//   },
// ];
