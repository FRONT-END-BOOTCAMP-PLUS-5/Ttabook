export const textSizes = {
  xs: {
    fontSize: '10px',
    lineHeight: '14px',
  },
  sm: {
    fontSize: '12px',
    lineHeight: '16px',
  },
  md: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  lg: {
    fontSize: '20px',
    lineHeight: '28px',
  },
  xl: {
    fontSize: '24px',
    lineHeight: '32px',
  },
} as const;

export type TextSize = keyof typeof textSizes;