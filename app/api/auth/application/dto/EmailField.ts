import { z } from 'zod';

export const emailField = z
  .string({ required_error: '이메일은 필수입니다.' })
  .min(1, '이메일은 필수입니다.')
  .email('유효하지 않은 이메일 형식입니다.');