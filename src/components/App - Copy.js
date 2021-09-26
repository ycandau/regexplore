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

import compile from '../regex/re_compile';

import useApplicationData from '../hooks/useApplicationData';

// replace with the actial server address when ready

const serverAddr = 'http://localhost:8080/';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
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
    height: '100%',
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

// const initHistory = (regex) => {
//   const { matchingNodes, nextNodesToTest } = regex.init();

//   return {
//     index: 0,
//     end: -1,
//     states: [
//       {
//         runState: 'running',
//         matchingNodes,
//         nextNodesToTest,
//         testRange: [0, 0],
//         matchRanges: [],
//       },
//     ],
//   };
// };

// const initLogs = () => ({ first: 0, list: [] });

// // const defaultRegex = compile('a+(abc)*|abc|def');
// const defaultRegex = compile('abc');
// const defaultHistory = initHistory(defaultRegex);

// const MAX_LOGS = 8;

//------------------------------------------------------------------------------
// App and state

const App = () => {
  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [tsq, setTSQ] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saveBoxTags, setSaveBoxTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(null);
  const [editorIndex, setEditorIndex] = useState(null);
  const [fetchStr, setFetchStr] = useState(false);
  const [user, setUser] = useState({});
  const [regexID, setRegexID] = useState(null);
  const [literal, setLiteral] = useState('');
  const [displayGraph, setDisplayGraph] = useState(true);

  const [
    state,
    { setRegex, setTestString, stepForward, stepBackward, toBeginning, play },
  ] = useApplicationData();

  const regex = state.regex;

  // const [regex, setRegex] = useState(defaultRegex);
  // const [testString, setTestString] = useState('abc def aaabc aaab 123');
  // const [history, setHistory] = useState(defaultHistory);
  // const [logs, setLogs] = useState(initLogs());
  // const [play, setPlay] = useState(false);
  // const [count, setCount] = useState(0);

  // const {
  //   runState,
  //   matchingNodes,
  //   nextNodesToTest,
  //   testRange,
  //   matchRanges,
  // } = history.states[history.index];

  //----------------------------------------------------------------------------

  // useEffect(() => {
  //   let timeout = null;
  //   if (play) {
  //     timeout = setTimeout(() => {
  //       onStepForward();
  //       console.log('Playing');
  //       setCount((count) => count + 1);
  //     }, 500);
  //   }
  //   return () => clearInterval(timeout);
  // }, [play, count]);

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
            rows: [{ test_string = '' }],
          } = await res.json();
          setTestString(test_string);
        } catch (e) {
          console.error(e);
        }
        setFetchStr(false);
      })();
  }, [fetchStr, setFetchStr, setTestString]);

  const writeRegex = async (mode) => {
    try {
      const newBody = { regexID };
      if (mode === 'del') {
        newBody.remove = true;
      } else {
        newBody.title = title;
        newBody.notes = desc;
        newBody.regex = literal;
        newBody.testStr = state.testString;
        newBody.tags = saveBoxTags.map(({ id, tag_name }) => ({
          id,
          tagName: tag_name,
        }));
      }
      const res = await fetch(serverAddr + 'regexes/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newBody),
      });
      const { id } = await res.json();
      setRegexID(id);
    } catch (e) {
      console.error(e);
    }
  };

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

  // // To set a new regex
  // const setNewRegex = (regexString) => {
  //   const regex = compile(regexString);
  //   setRegex(() => regex);
  //   setHistory(() => initHistory(regex));
  //   setLogs(initLogs());
  //   setDisplayGraph(true);
  //   setLiteral(regexString);
  // };

  //----------------------------------------------------------------------------
  // Editor

  const onEditorChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    const regexString = event.target.value;
    setRegex(regexString);
  };

  const onEditorHover = (ind) => () => {
    setEditorIndex(ind);
  };

  //--------------------------------------------------------------------------
  // TestStrField

  const onTestStrChange = (str) => {
    setDisplayGraph(true);
    setTestString(str);
    // setTestString(str);
    // setHistory(() => initHistory(regex));
    // setLogs(initLogs());
  };

  //----------------------------------------------------------------------------
  // InfoBox

  const tokenInfo = regex.getTokenInfo(editorIndex);

  //----------------------------------------------------------------------------
  // LogBox

  // const onStepForward = () => {
  //   const prevIndex = history.index;
  //   let end = history.end;
  //   const prevState = history.states[prevIndex];
  //   let prevNextNodesToTest = prevState.nextNodesToTest;

  //   const prevTestRange = prevState.testRange;
  //   const prevRunState = prevState.runState;

  //   // Return if at end of test string
  //   const [begin, prevPos] = prevTestRange;
  //   if (prevPos === testString.length) {
  //     setPlay(false);
  //     return;
  //   }

  //   // Retrace a forward step already taken
  //   const index = prevIndex + 1;
  //   if (prevIndex < history.states.length - 1) {
  //     setHistory({ ...history, index });
  //     const first = Math.max(history.index - MAX_LOGS + 1, 0);
  //     setLogs({ ...logs, first });
  //     return;
  //   }

  //   if (prevRunState === 'success' || prevRunState === 'failure') {
  //     const reset = regex.init();
  //     prevNextNodesToTest = reset.nextNodesToTest;
  //   }

  //   // Run the next step
  //   const ch = testString[prevPos];
  //   const char = ch === ' ' ? "' '" : ch;
  //   let { runState, matchingNodes, nextNodesToTest } = regex.step(
  //     prevNextNodesToTest,
  //     ch
  //   );

  //   const pos = prevPos + 1;
  //   let testRange = [];
  //   const matchRanges = [...prevState.matchRanges];
  //   let msg = '';

  //   switch (runState) {
  //     case 'running':
  //       testRange = [begin, pos];
  //       msg = `Char: ${char} - Nodes: ${matchingNodes.length}`;
  //       break;
  //     case 'success':
  //       testRange = [pos, pos];
  //       matchRanges.push([begin, pos]);
  //       msg = `Match: ${testString.slice(begin, pos)}`;
  //       break;
  //     case 'failure':
  //       testRange = [begin + 1, begin + 1];
  //       msg = 'No match';
  //       break;
  //     case 'end':
  //       testRange = [pos, pos];
  //       msg = 'End of test string';
  //       end = index;
  //       setPlay(false);
  //       break;
  //     default:
  //       break;
  //   }

  //   // Create a new log entry
  //   const first = Math.max(history.index - MAX_LOGS + 1, 0);
  //   const prompt = `[${begin}:${pos}]`;
  //   const log = { prompt, msg, key: history.index + 1 };
  //   const list = [...logs.list, log];
  //   setLogs({ first, list });

  //   // Set the next history state
  //   const nextState = {
  //     runState,
  //     matchingNodes,
  //     nextNodesToTest,
  //     testRange,
  //     matchRanges,
  //   };
  //   setHistory({
  //     ...history,
  //     index,
  //     end,
  //     states: [...history.states, nextState],
  //   });
  // };

  // const onStepBack = () => {
  //   if (history.index === 0) return;
  //   setHistory({ ...history, index: history.index - 1 });
  //   const first = Math.max(Math.min(history.index - 2, logs.first), 0);
  //   setLogs({ ...logs, first });
  // };

  // const onToBeginning = () => {
  //   setHistory({ ...history, index: 0 });
  //   setLogs({ ...logs, first: 0 });
  // };

  // const onPlay = () => {
  //   setPlay((play) => !play);
  // };

  //----------------------------------------------------------------------------
  // Callbacks

  const doFix = () => {
    const newRegex = compile(regex.autofix());
    setRegex(newRegex);
    // setHistory(() => initHistory(regex));
  };

  const toggleTheme = () => toggleLight((light) => !light);
  const toggleExplore = () =>
    setScreen((screen) => (screen === 'main' ? 'explore' : 'main'));
  const onSearchInput = (e) => {
    setPage(null);
    setTSQ(e.target.value);
  };
  const onSaveRegex = () => writeRegex();
  const onDeleteRegex = () => writeRegex('del');

  const onExploreRegex = ({ id, title, desc, literal, tags }) => {
    setScreen('main');
    onTestStrChange('fetching the test string..');
    setRegex(literal);
    setTitle(title);
    setDesc(desc);
    setFetchStr(id);
    setRegexID(id);
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

  const MAX_LOGS = 8;

  const logEnd = Math.min(state.firstLogIndex + MAX_LOGS, state.logs.length);
  const clippedLogs = state.logs.slice(state.firstLogIndex, logEnd);
  const situation =
    state.histIndex === 0
      ? 'atBeginning'
      : state.histIndex === state.histEnd
      ? 'atEnd'
      : '';

  const logBox = (
    <LogBox
      logs={clippedLogs}
      currentIndex={state.histIndex}
      onHover={(pos) => console.log('hovered over', pos)}
      onPlay={play}
      onStepBack={stepBackward}
      onStepForward={stepForward}
      onToBegining={toBeginning}
      play={play}
      situation={situation}
      displayGraph={displayGraph}
      setDisplayGraph={setDisplayGraph}
      onDeleteRegex={onDeleteRegex}
      isLoggedIn={!!user.id}
    />
  );

  const warningBox = (
    <WarningBox
      warnings={regex.warnings}
      onHover={(pos) => console.log('Hovering over the warning at', pos)}
      onFix={doFix}
    />
  );

  const histState = state.histStates[state.histIndex];

  const graphBox = displayGraph ? (
    <Graph
      graph={regex.graph}
      matchingNodes={histState.matchingNodes}
      runState={histState.runState}
    />
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

  //----------------------------------------------------------------------------

  const classes = useStyles();
  const muiTheme = light ? lightTheme : darkTheme;
  const isExploring = screen === 'explore';

  const current = {
    startInd: histState.testRange[1],
    endInd: histState.testRange[1] + 1,
    token: 'current',
  };
  const test = {
    startInd: histState.testRange[0],
    endInd: histState.testRange[1],
    token: 'test',
  };
  const testStringHighlights = [test, current];

  histState.matchRanges.forEach(([startInd, endInd]) => {
    const match = { startInd, endInd, token: 'match' };
    testStringHighlights.push(match);
  });

  const mainScreen = (
    <div className={classes.gridContainer}>
      <div className={classes.editorBox}>
        <Editor
          index={editorIndex}
          editorInfo={regex.lexemes}
          onRegexChange={onEditorChange}
          onHover={onEditorHover}
        />
      </div>
      <div className={classes.testStrBox}>
        <TestStrField
          numRows={6}
          string={state.testString}
          setString={onTestStrChange}
          highlights={testStringHighlights}
        />
      </div>
      <div className={classes.infoBox}>
        <InfoBox tokenInfo={tokenInfo} />
      </div>
      <div className={classes.logBox}>
        {regex.warnings.size ? warningBox : logBox}
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
