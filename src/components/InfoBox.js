import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Avatar, makeStyles } from '@material-ui/core';
import { WarningRounded, InfoRounded } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  avatar: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.custom.orange,
    fontFamily: 'Fira Mono',
    fontSize: 26,
  },
  headerTitle: {
    variant: 'h2',
    fontSize: 20,
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
  description: {
    color: theme.palette.text.secondary,
  },
  cardHeight: {
    height: '100%',
  },
}));

export default function InfoBox({ tokenInfo }) {
  const { label, name, description, note, warning } = tokenInfo;
  const classes = useStyles();
  return (
    <Card
      classes={{
        root: classes.cardHeight,
      }}
    >
      <CardHeader
        avatar={<Avatar className={classes.avatar}>{label}</Avatar>}
        title={<div className={classes.headerTitle}>{name}</div>}
      />
      <CardContent>
        <Typography className={classes.description}>{description}</Typography>
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
