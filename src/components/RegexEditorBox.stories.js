import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import RegexEditor from './RegexEditorBox';
import {
  hlBase,
  hlHoverValue,
  hlHoverParen,
  hlHoverOperator,
} from '../re/re_stubs';

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

export const HoverValue = Template.bind({});
HoverValue.args = {
  tokens: hlHoverValue,
};

export const HoverParen = Template.bind({});
HoverParen.args = {
  tokens: hlHoverParen,
};

export const HoverOperator = Template.bind({});
HoverOperator.args = {
  tokens: hlHoverOperator,
};

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
