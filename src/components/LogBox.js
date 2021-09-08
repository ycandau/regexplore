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
  PlayArrowRounded,
  SaveOutlined,
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
}));

export default function LogBox({
  logs,
  onHover,
  onToBegining,
  onStepBack,
  onPlay,
  onStepForward,
  onToEnd,
  onShowForm,
  displayGraph,
  isLoggedIn,
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
        classes={{ root: classes.headerRoot }}
        action={
          <>
            {isLoggedIn && (
              <IconButton onClick={onShowForm}>
                {displayGraph ? <Save /> : <SaveOutlined />}
              </IconButton>
            )}
            <IconButton onClick={onToBegining}>
              <FastRewindRounded />
            </IconButton>
            <IconButton onClick={onStepBack}>
              <SkipPreviousRounded />
            </IconButton>
            <IconButton onClick={onPlay}>
              <PlayArrowRounded />
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
      <CardContent classes={{ root: classes.cardContentRoot }}>
        <List dense disablePadding>
          {logList}
        </List>
      </CardContent>
    </Card>
  );
}
