import { z } from 'zod';

export const nameField = z
  .string({ required_error: '이름은 필수입니다.' })
  .min(1, '이름은 필수입니다.')
  .trim()
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 50자 이하여야 합니다.');