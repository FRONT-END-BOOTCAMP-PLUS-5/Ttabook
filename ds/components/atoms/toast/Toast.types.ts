import { ToastVariant } from '../../../styles/tokens/toast/variant';

export interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}
