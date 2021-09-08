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
  cardContentRoot: {
    paddingTop: 0,
  },
  headerRoot: {
    '& [class*="MuiCardHeader-action"]': {
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
  onStepBack,
  onPlay,
  onStepForward,

  onToBegining,
  play,
  situation,
  onToEnd,
  
  setDisplayGraph,
  onDeleteRegex,
  displayGraph,
  isLoggedIn,
}) {
  const classes = useStyles();
  const showGraph = () => setDisplayGraph(true);
  const logList = logs.map(({ prompt, msg, key }) => (
    <ListItem
      key={key}
      selected={currentIndex === key}
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
        action={
          <>
            // Save button
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
          
            // Play button
            <IconButton
              className={play ? classes.playOn : classes.playOff}
              onClick={() => {
                showGraph();
                onPlay();
              }}
            >
              <PlayArrow />
            </IconButton>

            // Step back
            <IconButton
              disabled={situation === 'atBeginning'}
              onClick={() => {
                showGraph();
                onStepBack();
              }}
            >
              <SkipPreviousRounded />
            </IconButton>

            // Step forward
            <IconButton
              disabled={situation === 'atEnd'}
              onClick={() => {
                showGraph();
                onStepForward();
              }}
            >
              <SkipNextRounded />
            </IconButton>

            // Back to beginning
            <IconButton
              disabled={situation === 'atBeginning'}
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
