import { AuthError } from './AuthError';

export class InvalidNameError extends AuthError {
  constructor(message: string = '이름은 필수입니다.') {
    super(message);
    this.name = 'InvalidNameError';
  }
}