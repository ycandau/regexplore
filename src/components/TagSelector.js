import { alpha, makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  flexBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: theme.spacing(2),
    backgroundColor: '#00000000',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: theme.spacing(2),
    width: '100%',
  },
  bagOfChips: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
  },
  selectedTagBox: {
    alignSelf: 'flex-start',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  selectedTagsChips: {
    display: 'flex',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
  },
  chip: {
    margin: theme.spacing(0.5),
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
  inputRoot: {},
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

export default function TagSelector({
  tags,
  setTags,
  selectedTags,
  setSelectedTags,
}) {
  const classes = useStyles();
  const [tsq, setTSQ] = useState('');

  const handleSearch = (e) => {
    setTSQ(e.target.value);
  };

  useEffect(() => {
    (async () => {
      try {
        let res;
        if (!tsq) {
          res = await fetch('/tags', {
            method: 'POST',
            headers: {
              Accepts: 'application/json',
            },
          });
        } else {
          res = await fetch('/tags/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tsq }),
          });
        }
        const tags = await res.json();
        setTags(tags);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [setTags, tsq]);

  return (
    <Paper className={classes.flexBox} elevation={0}>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="search tags.."
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          value={tsq}
          spellCheck={false}
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearch}
        />
      </div>
      <div className={classes.selectedTagBox}>
        <Typography variant="h6">Selected Tags</Typography>
      </div>
      <ul className={classes.selectedTagsChips}>
        {selectedTags.map(({ id, tag_name }) => (
          <li key={id}>
            <Chip
              label={tag_name}
              className={classes.chip}
              onDelete={() => {
                setSelectedTags((tags) =>
                  tags.filter((t) => tag_name !== t.tag_name)
                );
                setTags(() => tags.concat({ id, tag_name }));
              }}
            />
          </li>
        ))}
      </ul>
      <ul className={classes.bagOfChips}>
        {tags.map(({ id, tag_name }) => (
          <li key={id}>
            <Chip
              label={tag_name}
              className={classes.chip}
              onClick={() => {
                setSelectedTags(() => selectedTags.concat({ id, tag_name }));
                setTags((tags) => tags.filter((t) => tag_name !== t.tag_name));
              }}
            />
          </li>
        ))}
      </ul>
    </Paper>
  );
}
