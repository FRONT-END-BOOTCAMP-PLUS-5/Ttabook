import React from 'react';
import { TextProps } from './Text.types';
import '../../../styles/globals.css';
import styles from './Text.module.css';

const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  const className = [
    styles['ttabook-text'],
    styles[`ttabook-text--${variant}`],
    styles[`ttabook-text--${size}`],
  ];
  return (
    <div className={className.filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
};

export default Text;
