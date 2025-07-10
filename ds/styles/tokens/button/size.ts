import spacing from '../spacing';

export const buttonSizes = {
  lg: {
    height: '56px',
    minWidth: '120px',
    padding: `0 ${spacing[6]}`, // 24px
    fontSize: '18px',
    borderRadius: '12px',
  },
  md: {
    height: '48px',
    minWidth: '100px',
    padding: `0 ${spacing[5]}`, // 20px
    fontSize: '16px',
    borderRadius: '10px',
  },
  sm: {
    height: '40px',
    minWidth: '80px',
    padding: `0 ${spacing[4]}`, // 16px
    fontSize: '14px',
    borderRadius: '8px',
  },
};

export type ButtonSize = keyof typeof buttonSizes;
