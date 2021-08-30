import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}));

export default function GridWrapper({ width, children }) {
  const classes = useStyles();
  const rem = width || 20;
  return (
    <div className={classes.container} style={{ width: rem + 'rem' }}>
      {children}
    </div>
  );
}
