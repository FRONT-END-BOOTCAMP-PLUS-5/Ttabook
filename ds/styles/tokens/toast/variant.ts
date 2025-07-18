import { color } from '../color';

export const toastVariants = {
  primary: {
    background: color.primaryDark,
    color: color.background,
  },
  secondary: {
    background: color.primary,
    color: color.textPrimary,
  },
  accent: {
    background: color.accent,
    color: color.textPrimary,
  },
  danger: {
    background: color.errorDark,
    color: color.background,
  },
};

export type ToastVariant = keyof typeof toastVariants;
