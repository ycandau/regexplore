import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Avatar, makeStyles } from '@material-ui/core';
import { WarningRounded, InfoRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  avatar: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  iconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  warningIcon: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(2),
  },
  infoIcon: {
    color: theme.palette.info.main,
    paddingRight: theme.spacing(2),
  },
  cardHeght: {
    height: '100%',
  },
}));

export default function InfoBox({ desc }) {
  const { label, name, description, note, warning } = desc;
  const classes = useStyles();
  return (
    <Card
      classes={{
        root: classes.cardHeght,
      }}
    >
      <CardHeader
        avatar={<Avatar className={classes.avatar}>{label || 'i'}</Avatar>}
        title={name}
      />
      <CardContent>
        <Typography>{description}</Typography>
        {note && (
          <div className={classes.iconBox}>
            <InfoRounded className={classes.infoIcon} fontSize="large" />
            <Typography color="textSecondary" variant="body2">
              {note}
            </Typography>
          </div>
        )}
        {warning && (
          <div className={classes.iconBox}>
            <WarningRounded className={classes.warningIcon} fontSize="large" />
            <Typography color="textSecondary" variant="body2">
              {warning}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

//------------------------------------------------------------------------------

// const tokenInfoExample = {
//   label: '|',
//   pos: 3,
//   type: 'Operator',
//   name: 'Alternation operator',
//   description: 'Match either of the items preceding and following.',
//   operands: ['ab', 'cd'],
// };
