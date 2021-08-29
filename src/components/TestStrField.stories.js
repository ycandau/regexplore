import { ThemeProvider } from '@material-ui/core';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import TestStrField from './TestStrField';
import { useState } from 'react';

export default {
  title: 'App/Grid/TestStringField',
  component: TestStrField,
  args: {
    string: 'This is a demo string',
    numRows: 5,
    widthRems: 20,
    highlights: [
      { ind: [2, 4], token: 'match' },
      { ind: [6, 7], token: 'cursor' },
    ],
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

const Template = (args) => {
  const [str, setStr] = useState(args.string);
  return (
    <TestStrField
      string={str}
      setString={setStr}
      numRows={args.numRows}
      widthRems={args.widthRems}
      highlights={args.highlights}
    />
  );
};

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
