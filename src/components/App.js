import TagSelector from './TagSelector';
import RegexCard from './RegexCard';
import SaveBox from './SaveBox';
import InfoBox from './InfoBox';
import LogBox from './LogBox';
import { logs } from '../re/re_stubs';
import TestStrField from './TestStrField';
import Header from './Header';
import Editor from './Editor';
import {
  ThemeProvider,
  createTheme,
  makeStyles,
} from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import CssBaseline from '@material-ui/core/CssBaseline';
import '@fontsource/roboto';
import '@fontsource/fira-code';

import Parser from '../re/re_parser';
import WarningBox from './WarningBox';

// rendering stubs, TODO: clean up once the wiring's done

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
    padding: theme.spacing(2),
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
  const [light, toggleLight] = useState(false);
  const [screen, setScreen] = useState('main');
  const [tsq, setTSQ] = useState('');
  const [testString, setTestString] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState([]);
  const [regexes, setRegexes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [index, setIndex] = useState(null);
  const [parser, setParser] = useState(new Parser('a(b|c)de'));
  const [fetchStr, setFetchStr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let res;
        let baseBody = { tags: selectedTags.map(({ id }) => id) };
        if (!tsq) {
          res = await fetch('/regexes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...baseBody }),
          });
        } else {
          res = await fetch('/regexes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tsq, ...baseBody }),
          });
        }
        const { regexes } = await res.json();
        setRegexes(regexes);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tsq, selectedTags, setRegexes]);

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
  // Parser for the Regex Editor

  const onRegexChange = (event) => {
    if (event.nativeEvent.inputType === 'insertLineBreak') return;
    const regex = event.target.value;
    setParser(() => new Parser(regex));
  };

  const onHover = (index) => () => {
    setIndex(index);
  };

  const tokenInfo = index !== null ? parser.tokenInfo(index) : {};

  //----------------------------------------------------------------------------

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
      warnings={parser.warnings}
      onHover={(pos) => console.log('Hovering over the warning at', pos)}
      onFix={() => console.log("'FIX' button clicked")}
    />
  );
  //----------------------------------------------------------------------------

  const toggleTheme = () => toggleLight((light) => !light);
  const toggleExplore = () =>
    setScreen((screen) => (screen === 'main' ? 'explore' : 'main'));
  const onSearchInput = (e) => {
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
    setTags(tags);
  };

  const onSelectTag = ({ id, tag_name }) => {
    if (selectedTags.some((t) => id === t.id)) return;
    setSelectedTags((tags) => tags.concat({ id, tag_name }));
  };

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
        <InfoBox desc={tokenInfo} />
      </div>
      <div className={classes.logBox}>
        {!!parser.warnings.length ? warningBox : logBox}
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
        {regexes.map(({ id, user_name, title, notes, regex, tags }) => (
          <div className={classes.regexCardBox} key={id}>
            <RegexCard
              {...{
                id,
                title,
                desc: notes,
                literal: regex,
                tagsObj: tags,
                user_name,
                onExploreRegex,
                onSelectTag,
              }}
            />
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
          search: tsq,
          onSearchInput,
        }}
      />
      {screen === 'main' ? mainScreen : exploreScreen}
    </ThemeProvider>
  );
};

export default App;
