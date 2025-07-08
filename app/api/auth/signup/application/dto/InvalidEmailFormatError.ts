import { AuthError } from './AuthError';

export class InvalidEmailFormatError extends AuthError {
  constructor(email: string) {
    super(`유효하지 않은 이메일 형식입니다: ${email}`);
    this.name = 'InvalidEmailFormatError';
  }
}