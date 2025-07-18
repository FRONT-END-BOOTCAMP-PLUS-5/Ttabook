import { ToastVariant } from '@/ds/styles/tokens/toast/variant';

export interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}
