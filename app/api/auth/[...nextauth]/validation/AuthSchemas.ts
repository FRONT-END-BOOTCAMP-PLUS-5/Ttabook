import { z } from 'zod';
import { UserType } from '../../../domain/types/UserType';

// 기본 검증 규칙들
const email = z
  .string({ required_error: '이메일은 필수입니다.' })
  .min(1, '이메일은 필수입니다.')
  .email('유효하지 않은 이메일 형식입니다.');

const password = z
  .string({ required_error: '비밀번호는 필수입니다.' })
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .max(100, '비밀번호는 100자 이하여야 합니다.');

const name = z
  .string({ required_error: '이름은 필수입니다.' })
  .min(1, '이름은 필수입니다.')
  .trim()
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 50자 이하여야 합니다.');

const userType = z
  .enum(['user', 'admin'] as const, {
    required_error: '사용자 타입은 필수입니다.',
    invalid_type_error: '유효하지 않은 사용자 타입입니다.',
  })
  .default('user' as UserType);

// 스키마 정의
export const SignupRequestSchema = z.object({
  email,
  password,
  name,
  type: userType,
});

export const LoginRequestSchema = z.object({
  email,
  password,
});

// 타입 추론
export type SignupRequestInput = z.input<typeof SignupRequestSchema>;
export type SignupRequestOutput = z.output<typeof SignupRequestSchema>;
export type LoginRequestInput = z.input<typeof LoginRequestSchema>;
export type LoginRequestOutput = z.output<typeof LoginRequestSchema>;

// 검증 함수들
export const validateSignupRequest = (data: unknown) => {
  return SignupRequestSchema.parse(data);
};

export const validateLoginRequest = (data: unknown) => {
  return LoginRequestSchema.parse(data);
};

// 안전한 검증 함수들 (에러를 반환하는 대신 결과 객체 반환)
export const safeValidateSignupRequest = (data: unknown) => {
  return SignupRequestSchema.safeParse(data);
};

export const safeValidateLoginRequest = (data: unknown) => {
  return LoginRequestSchema.safeParse(data);
};