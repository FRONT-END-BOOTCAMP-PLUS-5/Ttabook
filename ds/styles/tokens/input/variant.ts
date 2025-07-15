import { color } from '../color';

export const inputVariants = {
  primary: {
    background: color.background,
    color: color.textPrimary,
    border: `1px solid ${color.primary}`,
    placeholder: color.textSecondary,
    focus: {
      border: `1.5px solid ${color.primaryDark}`,
      boxShadow: `0 0 0 2px ${color.primaryLight}`,
    },
  },
  secondary: {
    background: color.background,
    color: color.textSecondary,
    border: `1px solid ${color.secondary}`,
    placeholder: color.textSecondary,
    focus: {
      border: `1.5px solid ${color.secondary}`,
      boxShadow: `0 0 0 2px ${color.secondary}`,
    },
  },
  danger: {
    background: color.background,
    color: color.error,
    border: `1px solid ${color.error}`,
    placeholder: color.error,
    focus: {
      border: `1.5px solid ${color.errorDark}`,
      boxShadow: `0 0 0 2px ${color.error}`,
    },
  },
  outline: {
    background: color.background,
    color: color.textPrimary,
    border: `1px solid ${color.textSecondary}`,
    placeholder: color.textSecondary,
    focus: {
      border: `1.5px solid ${color.primary}`,
      boxShadow: `0 0 0 2px ${color.primaryLight}`,
    },
  },
  disabled: {
    background: color.background,
    color: color.textSecondary,
    border: `1px solid ${color.primaryLight}`,
    placeholder: color.textSecondary,
  },
} as const;

export type InputVariant = keyof typeof inputVariants;
