import type { Meta, StoryObj } from '@storybook/nextjs';
import InputField from './InputField';

export const ActionsData = {
  // onClick: fn(),
};

const meta = {
  component: InputField,
  title: 'Components/Molecules/InputField',
  tags: ['autodocs'],
  //👇 Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  args: {
    ...ActionsData,
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalField: Story = {
  args: {
    inputProps: {
      variant: 'primary',
      placeholder: 'email을 입력하세요',
    },
    labelProps: {
      variant: 'primary',
      size: 'md',
      children: 'email',
    },
    direction: 'row',
  },
};

export const VerticalField: Story = {
  args: {
    inputProps: {
      _size: 'md',
      variant: 'secondary',
      placeholder: 'email을 입력하세요',
    },
    labelProps: {
      variant: 'primary',
      size: 'sm',
      children: 'email',
    },
    direction: 'column',
  },
};
