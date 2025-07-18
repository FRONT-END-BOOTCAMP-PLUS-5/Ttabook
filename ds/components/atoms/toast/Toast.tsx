import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import '../../../styles/globals.css';
import { ToastProps } from './Toast.types';

const Toast: React.FC<ToastProps> = ({
  message,
  variant,
  duration = 1500,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  const className = [
    styles.toast,
    styles[`toast-${variant}`],
    visible ? '' : styles['toast-hidden'],
  ];

  return <div className={className.filter(Boolean).join(' ')}>{message}</div>;
};

export default Toast;
