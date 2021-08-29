import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    width: '20rem',
    gridGap: theme.spacing(2),
  },
}));

export default function GridWrapper({ children }) {
  const classes = useStyles();
  return <div className={classes.container}>{children}</div>;
}
