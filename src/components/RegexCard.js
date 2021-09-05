import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { CardHeader, Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
  },
  headerRoot: {
    '& [class*="MuiCardHeader-action"]': {
      alignSelf: 'flex-end',
      margin: 0,
    },
  },
  regex: {
    fontFamily: 'Fira Code',
    fontWeight: '700',
    marginBlockStart: theme.spacing(-2),
    marginBlockEnd: theme.spacing(2),
  },
  bagOfChips: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    justifyContent: 'flex-end',
    padding: theme.spacing(0.5),
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
  onSelectTag,
  user_name,
  onExploreRegex,
}) {
  const classes = useStyles();
  const tags =
    (tagsObj &&
      Object.entries(tagsObj).map(([id, tag_name]) => ({
        id,
        tag_name,
      }))) ||
    [];

  return (
    <Card variant="outlined" className={classes.cardRoot}>
      <CardHeader
        classes={{ root: classes.headerRoot }}
        title={title}
        subheader={'by ' + user_name}
        action={
          <Button
            variant="outlined"
            size="large"
            onClick={() =>
              onExploreRegex({
                id,
                title,
                desc,
                literal,
                tags,
              })
            }
          >
            Explore
          </Button>
        }
      />
      <CardContent>
        <Typography className={classes.regex}>{literal}</Typography>
        <Typography color="textSecondary">{desc}</Typography>
        <ul className={classes.bagOfChips}>
          {tags.map(({ id, tag_name }) => (
            <li key={id}>
              <Chip
                label={tag_name}
                className={classes.chip}
                onClick={() =>
                  onSelectTag({ id: Number.parseInt(id), tag_name })
                }
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
