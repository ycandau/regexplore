import SaveBox from './SaveBox';
import InfoBox from './InfoBox';
import LogBox from './LogBox';
import { description1, logs } from '../re/re_stubs';
import TestStrField from './TestStrField';
import Header from './Header';
import Container from '../draft/Container';
import {
  ThemeProvider,
  createTheme,
  makeStyles,
} from '@material-ui/core/styles';
import { useState } from 'react';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import CssBaseline from '@material-ui/core/CssBaseline';
import '@fontsource/roboto';
import '@fontsource/fira-code';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '45rem 1fr',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  editorBox: {
    gridColumn: '1/2',
    gridRow: '1/2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(-5),
  },
  testStrBox: {
    gridColumn: '1/2',
    gridRow: '2/3',
    padding: theme.spacing(2),
  },
  infoBox: {
    gridColumn: '2/3',
    gridRow: '1/3',
    height: '100%',
  },
  logBox: {
    gridColumn: '2/3',
    gridRow: '3/4',
  },
  saveBox: {
    gridColumn: '1/2',
    gridRow: '3/4',
  },
}));

const App = () => {
  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [search, setSearch] = useState('');
  const [testString, setTestString] = useState('');
  const [title, setTitle] = useState('Regex Title');
  const [desc, setDesc] = useState('Regex Description');
  const [tags, setTags] = useState(['Regex', 'Tags', 'Array']);

  const toggleTheme = () => toggleLight((light) => !light);
  const toggleExplore = () =>
    setScreen((screen) => (screen === 'main' ? 'explore' : 'main'));
  const onSearchInput = (e) => {
    setSearch(e.target.value);
  };
  const onSearchChange = (str) => console.log('Save Field Tag Search:', str);
  const onSave = () => console.log('Save Action Detected');

  const classes = useStyles();
  const muiTheme = light ? lightTheme : darkTheme;
  const isExploring = screen === 'explore';
  const isLoggedIn = false;
  const userInitial = 'U';

  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <CssBaseline />
      <Header
        {...{
          light,
          toggleTheme,
          isLoggedIn,
          userInitial,
          isExploring,
          toggleExplore,
          search,
          onSearchInput,
        }}
      />
      <div className={classes.gridContainer}>
        <div className={classes.editorBox}>
          <Container />
        </div>
        <div className={classes.testStrBox}>
          <TestStrField
            numRows={5}
            widthRems={45}
            string={testString}
            setString={setTestString}
            highlights={[]}
          />
        </div>
        <div className={classes.infoBox}>
          <InfoBox desc={description1} />
        </div>
        <div className={classes.logBox}>
          <LogBox
            logs={logs}
            onHover={(pos) => console.log('hovered over', pos)}
          />
        </div>
        <div className={classes.saveBox}>
          <SaveBox
            {...{
              title,
              setTitle,
              desc,
              setDesc,
              tags,
              setTags,
              onSearchChange,
              onSave,
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
