import { ThemeProvider } from '@material-ui/core';
import { useState } from 'react';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import SaveBox from './SaveBox';

export default {
  title: 'App/Save Box',
  component: SaveBox,
  args: {
    title: '',
    desc: '',
    tags: ['regex', 'tags', 'poorly implemented'],
  },
  argTypes: {
    onSearchChange: { action: 'Search Field Changed' },
    onSave: { action: 'Saved' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <GridWrapper width={35}>
          <Story />
        </GridWrapper>
      </ThemeProvider>
    ),
  ],
};

const Template = (args) => {
  const [title, setTitle] = useState(args.string);
  const [desc, setDesc] = useState(args.desc);
  const [tags, setTags] = useState(args.tags);
  return (
    <SaveBox
      title={title}
      setTitle={setTitle}
      desc={desc}
      setDesc={setDesc}
      tags={tags}
      setTags={setTags}
      onSearchChange={args.onSearchChange}
      onSave={args.onSave}
    />
  );
};

export const DarkTheme = Template.bind({});

export const LightTheme = Template.bind({});
LightTheme.decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <GridWrapper width={35}>
        <Story />
      </GridWrapper>
    </ThemeProvider>
  ),
];
