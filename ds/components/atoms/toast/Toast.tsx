import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';
import '../../../styles/globals.css';
import { ToastProps } from './Toast.types';

const Toast: React.FC<ToastProps> = ({ message, variant, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const className = [
    styles.toast,
    styles[`toast-${variant}`],
    visible ? '' : styles['toast-hidden'],
  ];

  return <div className={className.filter(Boolean).join(' ')}>{message}</div>;
};

export default Toast;
