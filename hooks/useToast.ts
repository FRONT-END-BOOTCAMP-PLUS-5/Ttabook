import { ToastVariant } from '@/ds/styles/tokens/toast/variant';
import { create } from 'zustand';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, variant: ToastVariant) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, variant) => {
    const id = toastId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
