import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { CardHeader, IconButton } from '@material-ui/core';
import { PlayArrowRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  detailsLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailsRigth: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bagOfChips: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export default function RegexCard({
  id,
  title,
  desc,
  literal,
  tagsObj,
  user_name,
  onExploreRegex,
}) {
  const classes = useStyles();
  const tags = Object.entries(tagsObj).map(([id, tag_name]) => ({
    id,
    tag_name,
  }));

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={literal}
        action={
          <IconButton
            onClick={() =>
              onExploreRegex({
                id,
                title,
                desc,
                literal,
              })
            }
          >
            <PlayArrowRounded fontSize="large" />
          </IconButton>
        }
      />
      <CardContent className={classes.root}>
        <div className={classes.detailsLeft}>
          <Typography variant="body2" color="textSecondary">
            {desc}
          </Typography>
        </div>
        <div className={classes.detailsRigth}>
          <ul className={classes.bagOfChips}>
            {tags.map(({ id, tag_name }) => (
              <li key={id}>
                <Chip label={tag_name} className={classes.chip} />
              </li>
            ))}
          </ul>
          <Typography variant="body2" color="textSecondary">
            by {user_name}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
