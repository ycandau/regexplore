import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  warnList: {
    color:
      theme.palette.type === 'dark'
        ? theme.palette.warning.main
        : theme.palette.error.dark,
    listStyleType: '⚠',
  },
}));

export default function WarningBox({ warnings, onClick }) {
  const classes = useStyles();
  const warnList = warnings.map(({ pos, excerpt, message, fix }) => (
    <ListItem key={pos} button onClick={() => onClick(pos)}>
      <ListItemText
        primary={message}
        secondary={
          <>
            At position {pos} {excerpt && ", '" + excerpt + "'"} - {fix}
          </>
        }
      />
    </ListItem>
  ));

  return (
    <div>
      <Card className={classes.warnList}>
        <CardContent>
          <CardHeader title="⚠️ Warnings" />
          <List dense disablePadding>
            {warnList}
          </List>
        </CardContent>
      </Card>
    </div>
  );
}
