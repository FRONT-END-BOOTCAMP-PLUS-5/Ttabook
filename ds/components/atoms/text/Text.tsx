import React from 'react';
import { TextProps } from './Text.types';
import '../../../styles/globals.css'; // Ensure global styles are imported
import styles from './Text.module.css'; // Import specific styles for Text component  

const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
}) => {
  return (
    <div className={`ttabook-text ${styles[`ttabook-text--${variant}`]} ${styles[`ttabook-text--${size}`]}`}>
      {children}
    </div>
  );
};

export default Text;