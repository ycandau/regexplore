import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import WarningBox from './WarningBox';
import { warnings } from '../re/re_stubs';

export default {
  title: 'App/Warning Box',
  component: WarningBox,
  args: {
    warnings,
  },
  argTypes: {
    onHover: { action: 'Mouse hover' },
    onFix: { action: 'Fix Button Clicked' },
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

const Template = (args) => <WarningBox {...args} />;

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
