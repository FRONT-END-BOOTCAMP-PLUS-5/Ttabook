import { z } from 'zod';
import { UserType } from '../../../domain/types/UserType';

export const userTypeField = z
  .enum(['user', 'admin'] as const, {
    required_error: '사용자 타입은 필수입니다.',
    invalid_type_error: '유효하지 않은 사용자 타입입니다.',
  })
  .default('user' as UserType);