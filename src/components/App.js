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

import Parser from '../re/re_parser';
import { stepForward } from '../re/re_run';

// replace with the actial server address when ready
const serverAddr = 'http://localhost:8080/';

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
    overflowY: 'hidden',
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
  begin: 0,
  end: 0,
  states: [{ runState: 'running', activeNodes: [parser.nfa] }],
});

const defaultParser = new Parser('ab(c|x)de|abcxy|a.*.*.*x|.*...x');
const defaultHistory = initHistory(defaultParser);

//------------------------------------------------------------------------------
// App and state

const App = () => {
  // console.log('Render: App');

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
  const [user, setUser] = useState({});

  const [displayGraph, setDisplayGraph] = useState(true);

  const [parser, setParser] = useState(defaultParser);
  const [history, setHistory] = useState(defaultHistory);
  const [logs, setLogs] = useState([]);

  //----------------------------------------------------------------------------
  // Hooks

  useEffect(() => {
    if (!!fetchStr)
      (async () => {
        try {
          const res = await fetch(serverAddr + 'test-strings/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: fetchStr }),
          });
          const {
            rows: [{ test_string = 'failed to fetch the test string' }],
          } = await res.json();
          setTestString(test_string);
        } catch (e) {
          console.error(e);
        }
        setFetchStr(false);
      })();
  }, [fetchStr, setFetchStr, setTestString]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(serverAddr + 'auth/userinfo', {
          credentials: 'include',
        });
        const usr = await res.json();
        setUser(usr);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  //----------------------------------------------------------------------------

  // To set a new regex
  const setNewRegex = (regex) => {
    const parser = new Parser(regex);
    setParser(() => parser);
    setHistory(() => initHistory(parser));
    setLogs(() => []);
    setDisplayGraph(true);
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

  //--------------------------------------------------------------------------
  // TestStrField

  const onTestStrChange = (str) => {
    setTestString(str);
    setHistory(() => initHistory(parser));
    setLogs(() => []);
  };

  //----------------------------------------------------------------------------
  // InfoBox

  const msg = 'Hover over any character in the regex to get information on it.';
  const tokenInfo =
    index !== null ? parser.tokenInfo(index) : { description: msg };

  //----------------------------------------------------------------------------
  // LogBox

  const onStepForward = () => {
    // Block forward step
    const index = history.index;
    const prevActiveNodes = history.states[index].activeNodes;
    if (prevActiveNodes.length === 0 || index === testString.length) {
      return;
    }

    // Retrace a previous step
    if (index < history.states.length - 1) {
      setHistory({ ...history, index: index + 1 });
      return;
    }

    // Run the next step
    const ch = testString[index];
    let { runState, activeNodes } = stepForward(
      parser.nodes,
      prevActiveNodes,
      ch
    );

    // If the end of the test string is reached
    if (runState === 'running' && index === testString.length - 1) {
      runState = 'failure';
    }

    // Push a log entry
    const msg =
      runState === 'running'
        ? `Char: ${ch} - Nodes: ${activeNodes.length}`
        : runState === 'success'
        ? 'Successful match'
        : activeNodes.length === 0
        ? 'No match'
        : 'End of test string';

    const log = { prompt: `[0:${index}]`, msg };
    setLogs((logs) => [...logs, log]);

    // Set the history state
    const nextState = { runState, activeNodes };
    setHistory({
      ...history,
      index: index + 1,
      states: [...history.states, nextState],
    });
  };

  const onStepBack = () => {
    if (history.index === 0) return;
    setHistory({ ...history, index: history.index - 1 });
  };

  const onToBeginning = () => {
    setHistory({ ...history, index: 0 });
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
  const onSaveRegex = () => console.log('Save Action Detected');
  const onShowForm = () => setDisplayGraph((b) => !b);

  const onExploreRegex = ({ id, title, desc, literal, tags }) => {
    setScreen('main');
    onTestStrChange('fetching the test string..');
    setNewRegex(literal);
    setTitle(title);
    setDesc(desc);
    setFetchStr(id);
    setSaveBoxTags(tags);
    setDisplayGraph(true);
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
      displayGraph={displayGraph}
      onShowForm={onShowForm}
    />
  );

  const warningBox = (
    <WarningBox
      warnings={parser.warnings}
      onHover={(pos) => console.log('Hovering over the warning at', pos)}
      onFix={doFix}
    />
  );

  const { runState, activeNodes } = history.states[history.index];

  const graphBox = displayGraph ? (
    <Graph graph={parser.graph} activeNodes={activeNodes} runState={runState} />
  ) : (
    <SaveBox
      {...{
        title,
        setTitle,
        desc,
        setDesc,
        saveBoxTags,
        setSaveBoxTags,
        onSaveRegex,
        serverAddr,
      }}
    />
  );

  const classes = useStyles();
  const muiTheme = light ? lightTheme : darkTheme;
  const isExploring = screen === 'explore';

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
              serverAddr,
            }}
          />
        }
      </div>
      <div className={classes.tagSelectBox}>
        <TagSelector
          {...{ tags, setTags, selectedTags, onSelectTag, serverAddr }}
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
          serverAddr,
          user,
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
