import type { Meta, StoryObj } from '@storybook/nextjs';
import Footer from './Footer';
import { CaptionText, DescText } from '../../atoms/text/textWrapper';

const meta = {
  title: 'Components/Molecules/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <div>
          <DescText style={{ marginTop: 0 }}>따북이조</DescText>
          <CaptionText style={{ margin: 0 }}>김강현</CaptionText>
          <CaptionText style={{ margin: 0 }}>김지우</CaptionText>
          <CaptionText style={{ margin: 0 }}>박주영</CaptionText>
          <CaptionText style={{ margin: 0 }}>최광민</CaptionText>
        </div>
        <div>예약하기</div>
      </>
    ),
  },
};
