import { ThemeProvider } from '@material-ui/core';
import { useState } from 'react';
import darkTheme from '../mui-themes/base-dark';
import lightTheme from '../mui-themes/base-light';
import GridWrapper from './GridWrapper';
import TagSelector from './TagSelector';

export default {
  title: 'App/Tag Selector',
  component: TagSelector,
  args: {
    selectedTags: ['selected', 'tags'],
    tags: ['regex', 'tags', 'poorly implemented'],
  },
  argTypes: {
    onSearchChange: { action: 'Search Field Changed' },
    setSelectedTags: { action: 'Selected Tags Updated' },
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
  const [tags, setTags] = useState(args.tags);
  const [selectedTags, setSelectedTags] = useState(args.selectedTags);
  return (
    <TagSelector
      tags={tags}
      setTags={setTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      onSearchChange={args.onSearchChange}
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
