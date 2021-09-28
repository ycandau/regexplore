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
    color: theme.palette.custom.green,
  },
  avatar: {
    color: theme.palette.custom.green,
  },
  cardHeight: {
    height: '100%',
  },
  cardContentRoot: {
    paddingTop: 0,
  },
  headerRoot: {
    '& [class*="MuiCardHeader-action"]': {
      margin: 0,
    },
    color: theme.palette.custom.orange,
  },
  playOn: {
    backgroundColor: theme.palette.action.selected,
  },
  playOff: {},
}));

export default function LogBox({
  logsCurrentIndex,
  logsTopIndex,
  logsDisplayCount,
  logs,
  play,
  onPlay,
  onStepBackward,
  onStepForward,
  onToBegining,
  onHover,
  displayGraph,
  setDisplayGraph,
  onDeleteRegex,
  isLoggedIn,
}) {
  const classes = useStyles();
  const showGraph = () => setDisplayGraph(true);

  const atBeginning = false;
  const atEnd = false;

  const logEnd = Math.min(logsTopIndex + logsDisplayCount, logs.length);
  const clippedLogs = logs.slice(logsTopIndex, logEnd);

  const logList = clippedLogs.map(({ prompt, msg, key }, index) => (
    <ListItem
      key={key}
      selected={logsCurrentIndex - logsTopIndex === index}
      button
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
        classes={{ root: classes.headerRoot }}
        title={'Run'}
        action={
          <>
            {isLoggedIn &&
              (displayGraph ? (
                <IconButton onClick={() => setDisplayGraph(false)}>
                  <Save />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    onDeleteRegex();
                  }}
                >
                  <DeleteForever />
                </IconButton>
              ))}

            <IconButton
              className={play ? classes.playOn : classes.playOff}
              onClick={() => {
                showGraph();
                onPlay();
              }}
            >
              <PlayArrow />
            </IconButton>

            <IconButton
              disabled={atBeginning}
              onClick={() => {
                showGraph();
                onStepBackward();
              }}
            >
              <SkipPreviousRounded />
            </IconButton>

            <IconButton
              disabled={atEnd}
              onClick={() => {
                showGraph();
                onStepForward();
              }}
            >
              <SkipNextRounded />
            </IconButton>

            <IconButton
              disabled={atBeginning}
              onClick={() => {
                showGraph();
                onToBegining();
              }}
            >
              <Replay />
            </IconButton>
          </>
        }
      />
      <CardContent classes={{ root: classes.cardContentRoot }}>
        <List dense disablePadding>
          {logList}
        </List>
      </CardContent>
    </Card>
  );
}
