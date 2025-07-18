import React from 'react';
import { LoadingSpinnerProps } from './LoadingSpinner.types';
import styles from './LoadingSpinner.module.css';
import '../../../styles/globals.css';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 48,
  color = 'var(--color-primary)',
}) => {
  const borderWidth = Math.max(2, size / 10);

  return (
    <div
      className={styles.spinner}
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid transparent`,
        borderTopColor: color,
        borderLeftColor: color,
      }}
      role="status"
    >
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
