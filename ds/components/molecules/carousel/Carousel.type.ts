import React from 'react';

export interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
} 