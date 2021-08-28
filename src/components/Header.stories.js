import Header from './Header';

export default {
  title: 'Basic Header',
  component: Header,
};

const Template = (args) => <Header {...args} />;

export const FirstStory = Template.bind({});

FirstStory.args = {
  // args go here
};
