import { useEffect, useState } from 'react';

import Header from './Header';
import Editor from './Editor';
import InfoBox from './InfoBox';
import Graph from './Graph';
import SaveBox from './SaveBox';
import LogBox from './LogBox';
import WarningBox from './WarningBox';
import Page from './Page';
import TagSelector from './TagSelector';
import TestStrField from './TestStrField';

import {
  ThemeProvider,
  createTheme,
  makeStyles,
} from '@material-ui/core/styles';

import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import CssBaseline from '@material-ui/core/CssBaseline';

import '@fontsource/roboto';
import '@fontsource/fira-mono';

import { logs } from '../re/re_stubs';
import Parser from '../re/re_parser';
import { stepForward } from '../re/re_run';

// rendering stubs, TODO: clean up once the wiring's done

//------------------------------------------------------------------------------

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '8fr 3fr',
    gridTemplateRows: 'auto auto 1fr',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    height: 'calc(100vh - 64px)',
  },
  editorBox: {
    gridColumn: '1/2',
    gridRow: '1/2',
  },
  testStrBox: {
    gridColumn: '1/2',
    gridRow: '2/3',
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
    overflow: 'hidden',
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

//------------------------------------------------------------------------------
// Initialization

const initHistory = (parser) => ({
  index: 0,
  logs: [[parser.nfa]],
  match: null,
});

const defaultParser = new Parser('ab(c|x)de|abcxy|a.*.*.*x|.*...x');
const defaultHistory = initHistory(defaultParser);
//

//------------------------------------------------------------------------------
// App and state

const App = () => {
  console.log('Render: App');

  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [tsq, setTSQ] = useState('');
  const [testString, setTestString] = useState('abcde');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saveBoxTags, setSaveBoxTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(null);
  const [index, setIndex] = useState(null);
  const [fetchStr, setFetchStr] = useState(false);

  /*eslint no-unused-vars: 'off' */
  const [displayGraph, setDisplayGraph] = useState(true);

  const [parser, setParser] = useState(defaultParser);
  const [history, setHistory] = useState(defaultHistory);

  //----------------------------------------------------------------------------
  // Hooks

  useEffect(() => {
    if (!!fetchStr)
      (async () => {
        try {
          const res = await fetch('/test-strings/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: fetchStr }),
          });
          const { rows } = await res.json();
          const [{ test_string }] = rows;
          setTestString(test_string);
        } catch (e) {
          console.error(e);
        }
        setFetchStr(false);
      })();
  }, [fetchStr, setFetchStr, setTestString]);

  //----------------------------------------------------------------------------

  // To set a new regex
  const setNewRegex = (regex) => {
    const parser = new Parser(regex);
    setParser(() => parser);
    setHistory(() => initHistory(parser));
  };

  //----------------------------------------------------------------------------
  // Editor

  const onEditorChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    const regex = event.target.value;
    setNewRegex(regex);
  };

  const onEditorHover = (index) => () => {
    setIndex(index);
  };

  //----------------------------------------------------------------------------
  // InfoBox

  const tokenInfo = index !== null ? parser.tokenInfo(index) : {};

  //----------------------------------------------------------------------------
  // LogBox

  const onStepForward = () => {
    // End of test string
    const activeNodes = history.logs[history.index];
    if (
      activeNodes.length === 0 ||
      history.match ||
      history.index === testString.length
    ) {
      return;
    }

    // Retrace a previous step
    if (history.index < history.logs.length - 1) {
      const index = history.index + 1;
      setHistory({ ...history, index });
      return;
    }

    // Run the next step
    const { nextActiveNodes, match } = stepForward(
      parser.nodes,
      history.logs[history.index],
      testString[history.index]
    );

    // Found a match
    if (match) {
      console.log('success');
      return;
    }

    if (nextActiveNodes.length === 0) {
      console.log('failure');
      setHistory({ ...history, index: 0 });
      return;
    }

    const index = history.index + 1;
    const logs = [...history.logs, nextActiveNodes];
    setHistory({ ...history, index, logs });
  };

  const onStepBack = () => {
    if (history.index === 0) return;
    const index = history.index - 1;
    setHistory({ ...history, index });
  };

  const onToBeginning = () => {
    setHistory({ ...history, index: 0 });
  };

  // Graph

  const activeNodes = history.logs[history.index];

  // TestStrField

  const onTestStrChange = (str) => {
    setHistory({ ...history, index: 0 });
    setTestString(str);
  };

  //----------------------------------------------------------------------------
  // Callbacks

  const doFix = () => {
    const newRegex = parser.fix();
    const newParser = new Parser(newRegex);
    setParser(() => newParser);
    setHistory(() => initHistory(parser));
  };

  const toggleTheme = () => toggleLight((light) => !light);
  const toggleExplore = () =>
    setScreen((screen) => (screen === 'main' ? 'explore' : 'main'));
  const onSearchInput = (e) => {
    setPage(null);
    setTSQ(e.target.value);
  };
  const onSearchChange = (str) => console.log('Tag Search:', str);
  const onSave = () => console.log('Save Action Detected');

  const onExploreRegex = ({ id, title, desc, literal, tags }) => {
    setScreen('main');
    setParser(() => new Parser(literal));
    setTitle(title);
    setDesc(desc);
    setFetchStr(id);
    setSaveBoxTags(tags);
  };

  const onSelectTag = ({ id, tag_name }) => {
    setPage(null);
    setSelectedTags((tags) =>
      tags.some((t) => id === t.id)
        ? tags.filter((t) => id !== t.id)
        : tags.concat({ id, tag_name })
    );
  };

  //----------------------------------------------------------------------------
  // Components

  const logBox = (
    <LogBox
      logs={logs}
      onHover={(pos) => console.log('hovered over', pos)}
      onToBegining={onToBeginning}
      onStepBack={onStepBack}
      onStepForward={onStepForward}
      onToEnd={() => console.log('Jump to the end')}
    />
  );

  const warningBox = (
    <WarningBox
      warnings={parser.warnings}
      onHover={(pos) => console.log('Hovering over the warning at', pos)}
      onFix={doFix}
    />
  );

  const graphBox = displayGraph ? (
    <Graph graph={parser.graph} activeNodes={activeNodes} />
  ) : (
    <SaveBox
      {...{
        title,
        setTitle,
        desc,
        setDesc,
        tags: saveBoxTags,
        setTags: setSaveBoxTags,
        onSearchChange,
        onSave,
      }}
    />
  );

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
          onRegexChange={onEditorChange}
          onHover={onEditorHover}
        />
      </div>
      <div className={classes.testStrBox}>
        <TestStrField
          numRows={6}
          widthRems={45}
          string={testString}
          setString={onTestStrChange}
          highlights={[]}
        />
      </div>
      <div className={classes.infoBox}>
        <InfoBox desc={tokenInfo} />
      </div>
      <div className={classes.logBox}>
        {!!parser.warnings.length ? warningBox : logBox}
      </div>
      <div className={classes.saveBox}>{graphBox}</div>
    </div>
  );

  const exploreScreen = (
    <div className={classes.gridContainer}>
      <div className={classes.regexCards}>
        {
          <Page
            {...{
              tsq,
              selectedTags,
              page,
              setPage,
              onExploreRegex,
              onSelectTag,
            }}
          />
        }
      </div>
      <div className={classes.tagSelectBox}>
        <TagSelector {...{ tags, setTags, selectedTags, onSelectTag }} />
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
          search: tsq,
          onSearchInput,
        }}
      />
      {screen === 'main' ? mainScreen : exploreScreen}
    </ThemeProvider>
  );
};

export default App;
