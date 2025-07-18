import type { Meta, StoryObj } from '@storybook/nextjs';

import { fn } from 'storybook/test';
import Text from './Text';
import { TitleText, SubTitleText, DescText, CaptionText } from './textWrapper';

const meta = {
  title: 'Components/Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: fn(),
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof Text>;

export const Title: Story = {
  render: (args) => <TitleText {...args} />,
  args: {
    children: 'Title Text',
  },
};

export const SubTitle: Story = {
  render: (args) => <SubTitleText {...args} />,
  args: {
    children: 'SubTitle Text',
  },
};

export const Desc: Story = {
  render: (args) => <DescText {...args} />,
  args: {
    children: 'Description Text',
  },
};

export const Caption: Story = {
  render: (args) => <CaptionText {...args} />,
  args: {
    children: 'Caption Text',
  },
};
