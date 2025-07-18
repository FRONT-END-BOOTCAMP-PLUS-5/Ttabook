import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Carousel from './Carousel';
import Card from '../../atoms/card/Card';

const meta = {
  title: 'Components/Molecules/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <Card key={1}>Slide 1</Card>,
      <Card key={2}>Slide 2</Card>,
      <Card key={3}>Slide 3</Card>,
    ],
  },
};
