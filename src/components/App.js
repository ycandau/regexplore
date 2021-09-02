import TagSelector from './TagSelector';
import RegexCard from './RegexCard';
import SaveBox from './SaveBox';
import InfoBox from './InfoBox';
import LogBox from './LogBox';
import { description1, logs } from '../re/re_stubs';
import TestStrField from './TestStrField';
import Header from './Header';
import Editor from './Editor';
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

import Parser from '../re/re_parser';
import WarningBox from './WarningBox';

// rendering stubs, TODO: clean up once the wiring's done
const sampleRegexCard = {
  title: 'A Saved Regex',
  desc:
    'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Reprehenderit, officia saepe molestiae cupiditate, at illum modi dolores id ipsum.',
  literal: '/regex/i',
  tags: ['regex', 'tags', 'poorly implemented'],
  author: '@happyDevOps',
};
const exploreSelectedTags = ['selected', 'tags'];

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '8fr 3fr',
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
  regexCards: {
    gridColumn: '1/2',
  },
  regexCardBox: {
    paddingBlock: theme.spacing(1),
  },
  tagSelectBox: {
    gridColumn: '2/3',
  },
}));

const App = () => {
  // @ added
  const [index, setIndex] = useState(null);
  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [search, setSearch] = useState('');
  const [testString, setTestString] = useState('');
  const [title, setTitle] = useState('Regex Title');
  const [desc, setDesc] = useState('Regex Description');
  const [tags, setTags] = useState(['Regex', 'Tags', 'Array']);
  const [selectedTags, setSelectedTags] = useState(exploreSelectedTags);

  //----------------------------------------------------------------------------
  // Parser for the Regex Editor

  const [regex, setRegex] = useState('a(b|c)de');

  const parser = new Parser(regex);

  const { warnings } = parser;

  const onRegexChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    setRegex(() => event.target.value);
  };

  const onHover = (index) => () => {
    setIndex(index);
    // const tokenInfo = parser.tokenInfo(index);
  };

  // const tokenInfoExample = {
  //   label: '|',
  //   pos: 3,
  //   type: 'Operator',
  //   name: 'Alternation operator',
  //   description: 'Match either of the items preceding and following.',
  //   operands: ['ab', 'cd'],
  // };

  const logBox = (
    <LogBox
      logs={logs}
      onHover={(pos) => console.log('hovered over', pos)}
      onToBeginnig={() => console.log('Jump to the beginning')}
      onStepBack={() => console.log('Step Back')}
      onStepForward={() => console.log('Step Forward')}
      onToEnd={() => console.log('Jump to the end')}
    />
  );

  const warningBox = (
    <WarningBox
      warnings={warnings}
      onHover={(pos) => console.log('Hovering over the warning at', pos)}
      onFix={() => console.log("'FIX' button clicked")}
    />
  );
  //----------------------------------------------------------------------------

  const toggleTheme = () => toggleLight((light) => !light);
  const toggleExplore = () =>
    setScreen((screen) => (screen === 'main' ? 'explore' : 'main'));
  const onSearchInput = (e) => {
    setSearch(e.target.value);
  };
  const onSearchChange = (str) => console.log('Tag Search:', str);
  const onSave = () => console.log('Save Action Detected');

  const classes = useStyles();
  const muiTheme = light ? lightTheme : darkTheme;
  const isExploring = screen === 'explore';
  const isLoggedIn = false;
  const userInitial = 'U';

  const mainScreen = (
    <div className={classes.gridContainer}>
      <div className={classes.editorBox}>
        <Editor
          index={index}
          editorInfo={parser.editorInfo}
          onRegexChange={onRegexChange}
          onHover={onHover}
        />
        ;
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
        {!!warnings.length ? warningBox : logBox}
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
  );

  const exploreScreen = (
    <div className={classes.gridContainer}>
      <div className={classes.regexCards}>
        {Array(8)
          .fill()
          .map(() => sampleRegexCard)
          .map((cardData) => (
            <div className={classes.regexCardBox}>
              <RegexCard {...cardData} />
            </div>
          ))}
      </div>
      <div className={classes.tagSelectBox}>
        <TagSelector
          {...{ tags, setTags, selectedTags, setSelectedTags, onSearchChange }}
        />
      </div>
    </div>
  );

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
      {screen === 'main' ? mainScreen : exploreScreen}
    </ThemeProvider>
  );
};

export default App;
