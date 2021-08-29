import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import RegexCard from './RegexCard';

export default {
  title: 'App/Grid/Regex Card',
  component: RegexCard,
  args: {
    title: 'A Saved Regex',
    desc:
      'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Reprehenderit, officia saepe molestiae cupiditate, at illum modi dolores id ipsum.',
    literal: '/regex/i',
    tags: ['regex', 'tags', 'poorly implemented'],
    author: '@happyDevOps',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <GridWrapper width={30}>
          <Story />
        </GridWrapper>
      </ThemeProvider>
    ),
  ],
};

const Template = (args) => {
  return <RegexCard {...args} />;
};

export const DarkTheme = Template.bind({});

export const LightTheme = Template.bind({});
LightTheme.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <GridWrapper width={30}>
        <Story />
      </GridWrapper>
    </ThemeProvider>
  ),
];
