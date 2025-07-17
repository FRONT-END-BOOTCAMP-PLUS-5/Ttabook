import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  background?: string;
} 