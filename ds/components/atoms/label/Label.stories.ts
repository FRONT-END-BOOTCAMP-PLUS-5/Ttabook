import type { Meta, StoryObj } from '@storybook/nextjs';
import Label from './Label';
import { textVariants } from '@/ds/styles/tokens/text/variant';
import { textSizes } from '@/ds/styles/tokens/text/size';

const meta: Meta<typeof Label> = {
  title: 'Components/Atoms/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.keys(textVariants),
      },
      description: 'The variant of the label',
      defaultValue: 'primary',
    },
    size: {
      control: {
        type: 'select',
        options: Object.keys(textSizes),
      },
      description: 'The size of the label',
      defaultValue: 'md',
    },
    children: {
      control: 'text',
      description: 'The content of the label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'This is a default label',
  },
};

export const LabelForInput: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Click me to focus input',
  },
};
