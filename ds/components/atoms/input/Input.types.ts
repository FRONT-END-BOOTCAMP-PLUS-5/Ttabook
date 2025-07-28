import React, { Ref } from 'react';
import { InputSize } from '../../../styles/tokens/input/size';
import { InputVariant } from '../../../styles/tokens/input/variant';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  _size?: InputSize;
  isFullWidth?: boolean;
  variant?: InputVariant;
  error?: string;
  required?: boolean;
  ref?: Ref<HTMLInputElement>;
}
