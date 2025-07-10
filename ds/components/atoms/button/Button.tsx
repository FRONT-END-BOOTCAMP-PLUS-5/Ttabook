import React from 'react';
import { ButtonProps } from './Button.types';
import '../../../styles/globals.css'; 
import styles from './Button.module.css';


const Button: React.FC<ButtonProps> = ({
  size = 'md',
  isFullWidth = false,
  variant = 'primary',
  children
}) => {
  return (
    <button className={`ttabook-btn ${styles[`ttabook-btn--${variant}`]} ${styles[`ttabook-btn--${size}`]} ${isFullWidth ? styles['ttabook-btn--fullwidth'] : ''}`} type="button">
      {children}
    </button>
  );
};

export default Button;