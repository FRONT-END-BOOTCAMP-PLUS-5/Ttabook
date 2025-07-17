import type { Meta, StoryObj } from '@storybook/nextjs';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Components/Atoms/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 128, step: 8 },
    },
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 48,
  },
};

export const CustomColor: Story = {
  args: {
    size: 64,
    color: '#ff0000',
  },
};

export const Small: Story = {
  args: {
    size: 24,
  },
};
