import type { Meta, StoryObj } from '@storybook/nextjs';

import { fn } from 'storybook/test';
import Button from './Button';
import Icon from '../icon/Icon';

const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  subcomponents: { Icon },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    size: 'md',
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Outline: Story = {
  args: {
    size: 'md',
    variant: 'outline',
    children: 'Outline',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const IconButton: Story = {
  args: {
    variant: 'icon',
    children: <Icon name="ic1_account" size={24} />,
  },
};

export const FullWidth: Story = {
  args: {
    isFullWidth: true,
    children: 'Full Width',
  },
};
