import spacing from '../spacing';

export const inputSizes = {
  lg: {
    height: '48px',
    padding: `0 ${spacing[5]}`,
    fontSize: '18px',
    borderRadius: '10px',
  },
  md: {
    height: '40px',
    padding: `0 ${spacing[4]}`,
    fontSize: '16px',
    borderRadius: '8px',
  },
  sm: {
    height: '32px',
    padding: `0 ${spacing[3]}`,
    fontSize: '14px',
    borderRadius: '6px',
  },
} as const;

export type InputSize = keyof typeof inputSizes;
