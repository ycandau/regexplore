import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  logList: {
    color:
      theme.palette.type === 'dark'
        ? theme.palette.info.light
        : theme.palette.info.dark,
  },
  avatar: {
    color:
      theme.palette.type === 'dark'
        ? theme.palette.info.light
        : theme.palette.info.dark,
  },
}));

export default function LogBox({ logs, onHover }) {
  const classes = useStyles();
  const logList = logs.map(({ pos, char, count }) => (
    <ListItem key={pos} button onMouseOver={() => onHover(pos)}>
      <ListItemIcon className={classes.avatar}>[{pos}]:</ListItemIcon>
      <ListItemText primary={`'${char}' => ${count} active states`} />
    </ListItem>
  ));

  return (
    <div>
      <Card className={classes.logList}>
        <CardContent>
          <CardHeader title="Execution Log" />
          <List dense disablePadding>
            {logList}
          </List>
        </CardContent>
      </Card>
    </div>
  );
}
