import type { Meta, StoryObj } from '@storybook/nextjs';
import TimePicker from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/Molecules/TimePicker',
  component: TimePicker,
  parameters: {
    // layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    availableTimes: {
      control: 'object',
      description: '선택 가능한 시간 배열 (숫자)',
    },
    reservedTimes: {
      control: 'object',
      description: '이미 예약된 시간 배열 (숫자)',
    },
    onTimeSelect: { action: 'timeSelected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const nineToFive = Array.from({ length: 9 }, (_, i) => i + 9); // 9시 ~ 17시

export const Default: Story = {
  args: {
    availableTimes: nineToFive,
    reservedTimes: [],
  },
};

export const WithReservedTimes: Story = {
  args: {
    availableTimes: nineToFive,
    reservedTimes: [10, 11, 15],
  },
};
