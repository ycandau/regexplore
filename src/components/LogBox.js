import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import {
  FastForwardRounded,
  FastRewindRounded,
  SkipNextRounded,
  SkipPreviousRounded,
} from '@material-ui/icons';

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
  cardHeght: {
    height: '100%',
  },
}));

export default function LogBox({
  logs,
  onHover,
  onToBeginnig,
  onStepBack,
  onStepForward,
  onToEnd,
}) {
  const classes = useStyles();
  const logList = logs.map(({ pos, char, count }) => (
    <ListItem key={pos} button onMouseOver={() => onHover(pos)}>
      <ListItemIcon className={classes.avatar}>[{pos}]:</ListItemIcon>
      <ListItemText primary={`'${char}' => ${count} active states`} />
    </ListItem>
  ));

  return (
    <Card className={classes.logList} classes={{ root: classes.cardHeght }}>
      <CardHeader
        title="Graph Log"
        action={
          <>
            <IconButton onClick={onToBeginnig}>
              <FastRewindRounded />
            </IconButton>
            <IconButton onClick={onStepBack}>
              <SkipPreviousRounded />
            </IconButton>
            <IconButton onClick={onStepForward}>
              <SkipNextRounded />
            </IconButton>
            <IconButton onClick={onToEnd}>
              <FastForwardRounded />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <List dense disablePadding>
          {logList}
        </List>
      </CardContent>
    </Card>
  );
}
