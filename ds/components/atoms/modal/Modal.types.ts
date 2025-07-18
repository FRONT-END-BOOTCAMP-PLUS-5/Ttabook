import React from 'react';

export interface ModalProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

export interface ModalContextType {
  onClose?: () => void;
}

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalCloseButtonProps {
  className?: string;
  onClick?: () => void;
}
