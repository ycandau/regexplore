import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import Header from './Header';

export default {
  title: 'App/Header',
  component: Header,
  args: {
    light: false,
    isLoggedIn: true,
    userInitial: 'U',
  },
  argTypes: {
    toggleTheme: { action: 'Theme Toggled' },
    toggleExplore: { action: 'Explore Mode Toggled' },
    onSearchInput: { action: 'Input Registered' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

const Template = (args) => <Header {...args} />;

export const DarkTheme = Template.bind({});

export const LightTheme = Template.bind({});
LightTheme.args = {
  light: true,
};
LightTheme.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];

export const ExploreMode = Template.bind({});
ExploreMode.args = {
  isExploring: true,
};

export const LogInMode = Template.bind({});
LogInMode.args = {
  isLoggedIn: false,
};
