import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

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

export default function RegexCard({ title, desc, literal, tags, author }) {
  const classes = useStyles();

  return (
    <Card>
      <CardContent className={classes.root}>
        <div className={classes.detailsLeft}>
          <Typography component="h6" variant="h6">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {desc}
          </Typography>
        </div>
        <div className={classes.detailsRigth}>
          <Typography variant="subtitle1">
            <pre>{literal}</pre>
          </Typography>
          <ul className={classes.bagOfChips}>
            {tags.map((tag, i) => (
              <li key={i}>
                <Chip label={tag} className={classes.chip} />
              </li>
            ))}
          </ul>
          <Typography variant="body2" color="textSecondary">
            by {author}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
