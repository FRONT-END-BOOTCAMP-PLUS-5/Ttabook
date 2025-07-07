import { AuthError } from './AuthError';

export class DuplicateEmailError extends AuthError {
  constructor(email: string) {
    super(`이미 존재하는 이메일입니다: ${email}`);
    this.name = 'DuplicateEmailError';
  }
}