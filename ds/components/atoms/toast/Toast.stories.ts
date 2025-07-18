import type { Meta, StoryObj } from '@storybook/nextjs';
import Toast from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Atoms/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    variant: { control: { type: 'radio', options: ['success', 'error'] } },
    duration: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    message: 'This is a success message!',
    variant: 'primary',
  },
};

export const Error: Story = {
  args: {
    message: 'This is an error message!',
    variant: 'accent',
  },
};
