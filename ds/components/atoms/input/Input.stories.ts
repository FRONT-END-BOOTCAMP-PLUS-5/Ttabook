import type { Meta, StoryObj } from '@storybook/nextjs';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'tertiary'],
      },
      description: 'The variant of the input.',
      defaultValue: 'primary',
    },
    _size: {
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
      description: 'The size of the input.',
      defaultValue: 'md',
    },
    isFullWidth: {
      control: 'boolean',
      description:
        'If `true`, the input will take up the full width of its container.',
      defaultValue: false,
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder text for the input.',
    },
    disabled: {
      control: 'boolean',
      description: 'If `true`, the input will be disabled.',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    _size: 'md',
    placeholder: 'Primary Input',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    _size: 'lg',
    placeholder: 'Outline Input',
  },
};

export const WidhError: Story = {
  args: {
    variant: 'primary',
    _size: 'lg',
    error: 'error message',
    placeholder: 'Error Input',
  },
};

export const Required: Story = {
  args: {
    variant: 'primary',
    _size: 'lg',
    required: true,
    error: '필수값입니다.',
    placeholder: 'Required Input',
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    _size: 'md',
    isFullWidth: true,
    placeholder: 'Full Width Input',
  },
  parameters: {
    // Add a container to demonstrate full width
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    _size: 'md',
    placeholder: 'Disabled Input',
    disabled: true,
  },
};
