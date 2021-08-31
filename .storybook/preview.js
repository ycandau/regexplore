import { muiTheme } from 'storybook-addon-material-ui';
import '@fontsource/roboto';
import '@fontsource/fira-code';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    default: 'dark',
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [muiTheme()];
