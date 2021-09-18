import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  warnList: {
    height: '100%',
    color:
      theme.palette.type === 'dark'
        ? theme.palette.warning.main
        : theme.palette.error.dark,
  },
  cardHeight: {
    height: '100%',
  },
}));

export default function WarningBox({ warnings, onHover, onFix }) {
  const classes = useStyles();

  const warnList = [...warnings.values()].map(
    ({ issue, msg, count }, index) => (
      <ListItem key={index} button onMouseOver={() => onHover()}>
        <ListItemText primary={`${issue} - [${count}]`} secondary={msg} />
      </ListItem>
    )
  );

  return (
    <div className={classes.cardHeight}>
      <Card className={classes.warnList}>
        <CardContent>
          <CardHeader
            title="Warnings"
            action={
              <Button
                size="large"
                variant="outlined"
                disabled={!warnings.size}
                className={classes.warnList}
                onClick={onFix}
              >
                Fix
              </Button>
            }
          />
          <List dense disablePadding>
            {warnList}
          </List>
        </CardContent>
      </Card>
    </div>
  );
}
