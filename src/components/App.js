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
  states: [
    {
      runState: 'running',
      activeNodes: [parser.nfa],
      testRange: [0, 0],
      matchRanges: [],
    },
  ],
});

const defaultParser = new Parser('ab(c|x)de|abcxy|a.*.*.*x|a.*...x');
const defaultHistory = initHistory(defaultParser);

//------------------------------------------------------------------------------
// App and state

const App = () => {
  // console.log('Render: App');

  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [tsq, setTSQ] = useState('');
  // const [testString, setTestString] = useState('an alpha beta gamma');
  const [testString, setTestString] = useState('abdx abc');
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
  const [logs, setLogs] = useState([]);

  const { runState, activeNodes, testRange, matchRanges } = history.states[
    history.index
  ];

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
    setLogs(() => []);
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

  const defaultInfo = {
    label: '?',
    name: 'Questions ...',
    description:
      'Hover over any character in the regex to get information on it.',
  };

  const tokenInfo = index !== null ? parser.tokenInfo(index) : defaultInfo;

  //----------------------------------------------------------------------------
  // LogBox

  const onStepForward = () => {
    const prevIndex = history.index;
    const prevState = history.states[prevIndex];
    const prevActiveNodes = prevState.activeNodes;
    const prevTestRange = prevState.testRange;

    // Return if at end of test string
    const [begin, prevPos] = prevTestRange;
    if (prevPos === testString.length) return;

    // Retrace a forward step already taken
    const index = prevIndex + 1;
    if (prevIndex < history.states.length - 1) {
      setHistory({ ...history, index });
      return;
    }

    // Run the next step
    const ch = testString[prevPos];
    const char = ch === ' ' ? "' '" : ch;
    let { runState, activeNodes } = stepForward(
      parser.nodes,
      prevActiveNodes,
      testString,
      prevPos
    );

    const pos = prevPos + 1;
    let testRange = [];
    const matchRanges = [...prevState.matchRanges];
    let msg = '';

    switch (runState) {
      case 'running':
        testRange = [begin, pos];
        msg = `Char: ${char} - Nodes: ${activeNodes.length}`;
        break;
      case 'success':
        activeNodes = [parser.nfa];
        testRange = [pos, pos];
        matchRanges.push([begin, pos]);
        msg = `Match: ${testString.slice(begin, pos)}`;
        break;
      case 'failure':
        activeNodes = [parser.nfa];
        testRange = [begin + 1, begin + 1];
        msg = 'No match';
        break;
      case 'end':
        testRange = [-1, -1];
        msg = 'End of test string';
        break;
      default:
        testRange = [-1, -1];
        break;
    }

    // Create new log entry
    const prompt = `[${0}:${0}]`;
    const log = { prompt, msg };
    setLogs((logs) => [...logs, log]);

    // Set the next history state
    const nextState = {
      runState,
      activeNodes,
      testRange,
      matchRanges,
    };
    setHistory({
      ...history,
      index,
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
    <Graph graph={parser.graph} activeNodes={activeNodes} runState={runState} />
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

  //----------------------------------------------------------------------------

  const classes = useStyles();
  const muiTheme = light ? lightTheme : darkTheme;
  const isExploring = screen === 'explore';
  const isLoggedIn = false;
  const userInitial = 'U';

  const current = {
    startInd: testRange[1],
    endInd: testRange[1] + 1,
    token: 'current',
  };
  const test = {
    startInd: testRange[0],
    endInd: testRange[1],
    token: 'test',
  };
  const testStringHighlights = [test, current];

  matchRanges.forEach(([startInd, endInd]) => {
    const match = { startInd, endInd, token: 'match' };
    testStringHighlights.push(match);
  });

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
          highlights={testStringHighlights}
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
