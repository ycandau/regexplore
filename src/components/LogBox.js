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
  listText: {
    fontFamily: 'Fira Mono',
  },
  avatar: {
    color:
      theme.palette.type === 'dark'
        ? theme.palette.info.light
        : theme.palette.info.dark,
  },
  cardHeight: {
    height: '100%',
  },
  headerRoot: {
    '& [class*="MuiCardHeader-action"]': {
      alignSelf: 'center',
      margin: 0,
    },
  },
}));

export default function LogBox({
  logs,
  onHover,
  onToBegining,
  onStepBack,
  onStepForward,
  onToEnd,
}) {
  const classes = useStyles();
  const logList = logs.map(({ prompt, msg }, index) => (
    <ListItem key={index} button /* onMouseOver={() => onHover(pos)} */>
      <ListItemIcon className={classes.avatar}>{prompt}</ListItemIcon>
      <ListItemText
        primary={msg}
        primaryTypographyProps={{ className: classes.listText }}
      />
    </ListItem>
  ));

  return (
    <Card className={classes.logList} classes={{ root: classes.cardHeight }}>
      <CardHeader
        title="Log"
        classes={{ root: classes.headerRoot }}
        action={
          <>
            <IconButton onClick={onToBegining}>
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
