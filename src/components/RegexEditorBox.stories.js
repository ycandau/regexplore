import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import RegexEditor from './RegexEditorBox';
import { hlBase } from '../re/re_stubs';

export default {
  title: 'App/Regex Editor',
  component: RegexEditor,
  args: {
    tokens: hlBase,
    widthRems: 20,
  },
  argTypes: {
    setTokens: { action: 'Tokens updated' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <GridWrapper>
          <Story />
        </GridWrapper>
      </ThemeProvider>
    ),
  ],
};

const Template = (args) => <RegexEditor {...args} />;

export const DarkTheme = Template.bind({});

export const LightTheme = Template.bind({});
LightTheme.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <GridWrapper>
        <Story />
      </GridWrapper>
    </ThemeProvider>
  ),
];
