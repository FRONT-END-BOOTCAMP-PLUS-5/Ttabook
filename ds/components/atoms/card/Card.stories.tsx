import type { Meta, StoryObj } from '@storybook/nextjs';
import Card from './Card';

const meta = {
  title: 'Components/Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Card',
  },
};

export const CustomSize: Story = {
  args: {
    children: 'Custom Size Card',
    width: 600,
    height: 150,
  },
};

export const CustomBackground: Story = {
  args: {
    children: 'Custom Background Card',
    background: '#f7e8a4',
  },
}; 