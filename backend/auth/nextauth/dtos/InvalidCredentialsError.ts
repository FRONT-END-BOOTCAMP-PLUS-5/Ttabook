import { AuthError } from './AuthError';

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('잘못된 이메일 또는 비밀번호입니다.');
    this.name = 'InvalidCredentialsError';
  }
}