import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Avatar, makeStyles } from '@material-ui/core';
import { WarningRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  avatar: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(1),
  },
  warningIcon: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(1),
  },
}));

export default function InfoBox({ desc }) {
  const { label, name, description, note, warning } = desc;
  const classes = useStyles();
  return (
    <div>
      <Card>
        <CardHeader
          avatar={<Avatar className={classes.avatar}>{label}</Avatar>}
          title={name}
        />
        <CardContent>
          <Typography>{description}</Typography>
          {note && (
            <Typography color="textSecondary" variant="body2">
              {note}
            </Typography>
          )}
          {warning && (
            <div className={classes.warningBox}>
              <WarningRounded className={classes.warningIcon} />
              <Typography variant="body2">{warning}</Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
