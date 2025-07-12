import React from 'react';
import { ButtonProps } from './Button.types';
import '../../../styles/globals.css';
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({
  size = 'md',
  isFullWidth = false,
  variant = 'primary',
  children,
  ...props
}) => {
  const className = [
    styles['ttabook-btn'],
    styles[`ttabook-btn--${variant}`],
    variant !== 'icon' ? styles[`ttabook-btn--${size}`] : '',
    isFullWidth ? styles['ttabook-btn--fullwidth'] : '',
  ];
  return (
    <button
      className={className.filter(Boolean).join(' ')}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
