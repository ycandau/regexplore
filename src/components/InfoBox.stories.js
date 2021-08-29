import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import InfoBox from './InfoBox';
import { description1, description2, description3 } from '../re/re_stubs';

export default {
  title: 'App/Grid/Infobox',
  component: InfoBox,
  args: {
    description1,
    description2,
    description3,
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

const Template = (args) => (
  <>
    <InfoBox desc={description1} />
    <InfoBox desc={description2} />
    <InfoBox desc={description3} />
  </>
);

export const DarkTheme = Template.bind({});

export const LightTheme = Template.bind({});
LightTheme.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <Story />
    </ThemeProvider>
  ),
];
