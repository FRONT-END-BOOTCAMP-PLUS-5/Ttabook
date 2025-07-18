'use client';

import React from 'react';
import Toast from '@/ds/components/atoms/toast/Toast';
import { useToastStore } from '@/hooks/useToast';

const ToastContainer = () => {
  const { toasts, dismissToast } = useToastStore();

  return (
    <>
      {toasts.map(({ id, message, variant }) => (
        <Toast
          key={id}
          message={message}
          variant={variant}
          onDismiss={() => dismissToast(id)}
        />
      ))}
    </>
  );
};

export default ToastContainer;
