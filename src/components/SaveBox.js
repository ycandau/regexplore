import { alpha, makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Chip from '@material-ui/core/Chip';
import { Button, TextField } from '@material-ui/core';
import { useState } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailsLeft: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(2),
    flexGrow: 1,
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
  cardHeight: {
    height: '100%',
  },
}));

export default function SaveBox({
  title,
  setTitle,
  desc,
  setDesc,
  tags,
  setTags,
  onSearchChange,
  onSave,
}) {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <Card classes={{ root: classes.cardHeight }}>
      <CardContent
        className={classes.root}
        classes={{ root: classes.cardHeight }}
      >
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
            size="small"
            className={classes.nameBox}
          />
          <TextField
            fullWidth
            id="regexDesc"
            variant="outlined"
            size="small"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            label="Description"
            multiline
            minRows={5}
          />
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
              value={search}
              inputProps={{ 'aria-label': 'search' }}
              onChange={handleSearch}
            />
          </div>
          <ul className={classes.bagOfChips}>
            {tags.map(({ id, tag_name }) => (
              <li key={id}>
                <Chip
                  label={tag_name}
                  className={classes.chip}
                  onDelete={() =>
                    setTags((tags) =>
                      tags.filter((t) => tag_name !== t.tag_name)
                    )
                  }
                />
              </li>
            ))}
          </ul>
          <div className={classes.grow} />
          <Button onClick={onSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
