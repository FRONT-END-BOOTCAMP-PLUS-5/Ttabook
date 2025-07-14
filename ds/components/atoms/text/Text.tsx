import React from 'react';
import { TextProps } from './Text.types';
import '../../../styles/globals.css';
import styles from './Text.module.css';

const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  className: externalClassName,
  ...props
}) => {
  const internalClasses = [
    styles['ttabook-text'],
    styles[`ttabook-text--${variant}`],
    styles[`ttabook-text--${size}`],
  ];

  const combinedClassName = [...internalClasses, externalClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <p className={combinedClassName} {...props}>
      {children}
    </p>
  );
};

export default Text;
