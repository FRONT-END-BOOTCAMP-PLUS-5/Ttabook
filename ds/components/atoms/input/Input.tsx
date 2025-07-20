import React from 'react';
import { InputProps } from './Input.types';
import '../../../styles/globals.css';
import styles from './Input.module.css';
import { CaptionText } from '../text/textWrapper';

const Input: React.FC<InputProps> = ({
  _size = 'md',
  isFullWidth = false,
  variant = 'primary',
  error,
  required,
  ref,
  ...props
}) => {
  const className = [
    styles['ttabook-input'],
    styles[`ttabook-input--${error ? 'danger' : variant}`],
    styles[`ttabook-input--${_size}`],
    isFullWidth ? styles[`ttabook-input--fullWidth`] : '',
  ];

  return (
    <div className={styles['ttabook-input-wrapper']}>
      {required && (
        <CaptionText variant="danger" size="md" style={{ lineHeight: '3px' }}>
          *
        </CaptionText>
      )}
      <input
        className={className.filter(Boolean).join(' ')}
        ref={ref}
        {...props}
        style={{ width: isFullWidth ? '100%' : '', boxSizing: 'border-box' }}
      />
      {error && (
        <div className={styles['error-message']}>
          <CaptionText variant="danger" style={{ margin: 0 }}>
            {error}
          </CaptionText>
        </div>
      )}
    </div>
  );
};

export default Input;
