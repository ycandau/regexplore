import { alpha, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Chip from '@material-ui/core/Chip';
import { Button, TextField } from '@material-ui/core';
import { useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailsLeft: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(2),
    width: '60%',
  },
  detailsRigth: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '40%',
  },
  nameBox: {
    marginBottom: theme.spacing(2),
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
  selectedChips: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
  },
  grow: {
    flexGrow: 1,
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
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
  cardPad: {
    height: '100%',
    backgroundColor: 'transparent',
    padding: 0,
    overflow: 'visible',
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
}));

export default function SaveBox({
  title,
  setTitle,
  desc,
  setDesc,
  saveBoxTags,
  setSaveBoxTags,
  onSaveRegex,
  serverAddr,
}) {
  const classes = useStyles();
  const [tsq, setTSQ] = useState('');
  const [tags, setTags] = useState([]);

  const onSelectTag = ({ id, tag_name }) =>
    setSaveBoxTags((tags) =>
      !tags.some((t) => tag_name === t.tag_name)
        ? tags.concat({ id, tag_name })
        : tags.filter((t) => tag_name !== t.tag_name)
    );

  const handleSearch = (e) => {
    setTSQ(e.target.value);
  };

  useEffect(() => {
    (async () => {
      try {
        let res;
        if (!tsq) {
          res = await fetch(serverAddr + 'tags', {
            method: 'POST',
          });
        } else {
          res = await fetch(serverAddr + 'tags/search', {
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
  }, [serverAddr, setTags, tsq]);

  return (
    <Card classes={{ root: classes.cardPad }} elevation={0}>
      <CardContent className={classes.root} classes={{ root: classes.cardPad }}>
        <div className={classes.detailsLeft}>
          <TextField
            fullWidth
            id="regexName"
            variant="filled"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            spellCheck="false"
            label="Name"
            required
            className={classes.nameBox}
          />
          <TextField
            fullWidth
            id="regexDesc"
            variant="filled"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            label="Description"
            multiline
            minRows={5}
          />
          <ul className={classes.selectedChips}>
            {saveBoxTags.map(({ id, tag_name }) => (
              <li key={id || tag_name}>
                <Chip
                  label={tag_name}
                  className={classes.chip}
                  onDelete={() => onSelectTag({ id, tag_name })}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className={classes.detailsRigth}>
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
              inputProps={{ 'aria-label': 'search' }}
              onChange={handleSearch}
            />
          </div>
          {!!tags.length ? (
            <ul className={classes.bagOfChips}>
              {tags.slice(0, 15).map(({ id, tag_name }) => (
                <li key={id}>
                  <Chip
                    size="small"
                    label={tag_name}
                    className={classes.chip}
                    onClick={() => onSelectTag({ id, tag_name })}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <Button
              className={classes.addButton}
              onClick={() => onSelectTag({ tag_name: tsq })}
            >
              Create Tag
            </Button>
          )}
          <div className={classes.grow} />
          <Button onClick={onSaveRegex}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
