import { z } from 'zod';

export const passwordField = z
  .string({ required_error: '비밀번호는 필수입니다.' })
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .max(100, '비밀번호는 100자 이하여야 합니다.');