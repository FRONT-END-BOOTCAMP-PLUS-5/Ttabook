import type { Meta, StoryObj } from '@storybook/nextjs';
import Icon from './Icon';

const meta = {
  title: 'Components/Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: {
        type: 'select',
        options: ['ic1_account'],
      },
    },
    size: {
      control: {
        type: 'range',
        min: 16,
        max: 80,
      },
    },
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AccountIcon: Story = {
  args: {
    name: 'ic1_account',
    size: 24,
    color: '#000000',
  },
};
