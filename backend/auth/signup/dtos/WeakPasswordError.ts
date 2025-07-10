import { AuthError } from './AuthError';

export class WeakPasswordError extends AuthError {
  constructor() {
    super('비밀번호는 최소 8자 이상이어야 합니다.');
    this.name = 'WeakPasswordError';
  }
}