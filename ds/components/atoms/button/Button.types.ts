import React from 'react';
import { ButtonSize } from '../../../styles/tokens/button/size';
import { ButtonVariant } from '../../../styles/tokens/button/variant';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  isFullWidth?: boolean;
  variant?: ButtonVariant;
  children?: React.ReactNode;
}
