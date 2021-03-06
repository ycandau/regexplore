import { alpha, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Brightness7 from '@material-ui/icons/Brightness7';
import Brightness4 from '@material-ui/icons/Brightness4';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  title: {
    display: 'none',
    fontFamily: 'Fira Mono',
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'flex',
  },
}));

export default function PrimarySearchAppBar({
  light,
  toggleTheme,
  serverAddr,
  user: { id, name, avatarURL },
  isExploring,
  toggleExplore,
  search,
  onSearchInput,
}) {
  const classes = useStyles();

  const isLoggedIn = !!id;
  const userInitial = !!name && name[0];

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            className={classes.title}
            variant="h4"
            component="h1"
            noWrap
          >
            RegExpLore
          </Typography>
          <div className={classes.grow} />
          {isExploring && (
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="search regexes.."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onChange={onSearchInput}
                value={search}
              />
            </div>
          )}
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <Button onClick={toggleExplore}>
              {isExploring ? 'Home' : 'Explore'}
            </Button>
            {isLoggedIn ? (
              <Button href={serverAddr + 'auth/logout'}>LOG OUT</Button>
            ) : (
              <Button href={serverAddr + 'auth/github'}>
                LOG IN WITH GITHUB
              </Button>
            )}
            {isLoggedIn && (
              <IconButton>
                <Avatar
                  className={classes.avatar}
                  src={avatarURL}
                  alt={userInitial}
                />
              </IconButton>
            )}
            <IconButton onClick={toggleTheme} edge="end">
              {light ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
