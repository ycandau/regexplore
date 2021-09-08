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
  PlayArrow,
  SkipNextRounded,
  SkipPreviousRounded,
  Replay,
  PlayArrowRounded,
  DeleteForever,
  Save,
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
  playOn: {
    backgroundColor: theme.palette.action.selected,
  },
  playOff: {},
}));

export default function LogBox({
  logs,
  currentIndex,
  onHover,
  onPlay,
  onStepBack,
  onStepForward,
  onToBegining,
  play,
  situation,
}) {
  const classes = useStyles();
  const logList = logs.map(({ prompt, msg, key }) => (
    <ListItem
      key={key}
      selected={currentIndex === key}
      button /* onMouseOver={() => onHover(pos)} */
    >
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
            <IconButton
              onClick={onPlay}
              className={play ? classes.playOn : classes.playOff}
            >
              <PlayArrow />
            </IconButton>
            <IconButton
              disabled={situation === 'atBeginning'}
              onClick={onStepBack}
            >
              <SkipPreviousRounded />
            </IconButton>
            <IconButton
              disabled={situation === 'atEnd'}
              onClick={onStepForward}
            >
              <SkipNextRounded />
            </IconButton>
            <IconButton
              disabled={situation === 'atBeginning'}
              onClick={onToBegining}
            >
              <Replay />
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
