import type { Meta, StoryObj } from '@storybook/nextjs';
import Header from './Header';
import Button from '../../atoms/button/Button';

const meta = {
  title: 'Components/Molecules/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    children: (
      <>
        <Button variant="outline" size="sm">
          로그인
        </Button>
        <Button variant="primary" size="sm">
          회원가입
        </Button>
      </>
    ),
  },
};

export const LoggedIn: Story = {
  args: {
    children: (
      <>
        <Button variant="outline" size="sm">
          마이페이지
        </Button>
        <Button variant="primary" size="sm">
          로그아웃
        </Button>
      </>
    ),
  },
};
