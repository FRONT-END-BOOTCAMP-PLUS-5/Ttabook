import React, { createContext, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ModalProps,
  ModalContextType,
  ModalTitleProps,
  ModalBodyProps,
  ModalCloseButtonProps,
} from './Modal.types';
import '../../../styles/globals.css';
import styles from './Modal.module.css';

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const useModalContext = () => {
  const context = useContext(ModalContext);
  return context;
};

const Modal: React.FC<ModalProps> & {
  Title: React.FC<ModalTitleProps>;
  Body: React.FC<ModalBodyProps>;
  CloseButton: React.FC<ModalCloseButtonProps>;
} = ({ width = 400, height = 500, children, onClose, isOpen = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={styles['ttabook-modal-backdrop']}
      onClick={handleBackdropClick}
    >
      <div
        className={styles['ttabook-modal']}
        style={{ width, height }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContext.Provider value={{ onClose }}>
          {children}
        </ModalContext.Provider>
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

const ModalTitle: React.FC<ModalTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`${styles['ttabook-modal-title']} ${className}`}>
      {children}
    </div>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles['ttabook-modal-body']} ${className}`}>
      {children}
    </div>
  );
};

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  className = '',
  onClick,
}) => {
  const modalContext = useModalContext();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (modalContext?.onClose) {
      modalContext.onClose();
    }
  };

  return (
    <button
      className={`${styles['ttabook-modal-close']} ${className}`}
      onClick={handleClick}
      aria-label="Close modal"
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 20L0 18L8 10L0 2L2 0L10 8L18 0L20 2L12 10L20 18L18 20L10 12L2 20Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.CloseButton = ModalCloseButton;

export default Modal;
