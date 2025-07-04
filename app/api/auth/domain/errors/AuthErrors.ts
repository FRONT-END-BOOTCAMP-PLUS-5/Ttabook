// 인증 도메인 특화 에러들
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class DuplicateEmailError extends AuthError {
  constructor(email: string) {
    super(`이미 존재하는 이메일입니다: ${email}`);
    this.name = 'DuplicateEmailError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('잘못된 이메일 또는 비밀번호입니다.');
    this.name = 'InvalidCredentialsError';
  }
}

export class WeakPasswordError extends AuthError {
  constructor() {
    super('비밀번호는 최소 8자 이상이어야 합니다.');
    this.name = 'WeakPasswordError';
  }
}

export class InvalidEmailFormatError extends AuthError {
  constructor(email: string) {
    super(`유효하지 않은 이메일 형식입니다: ${email}`);
    this.name = 'InvalidEmailFormatError';
  }
}

export class InvalidNameError extends AuthError {
  constructor(message: string = '이름은 필수입니다.') {
    super(message);
    this.name = 'InvalidNameError';
  }
}

export class ValidationError extends AuthError {
  public readonly issues: Array<{ path: string; message: string }>;
  
  constructor(issues: Array<{ path: string; message: string }>) {
    const message = issues.map(issue => `${issue.path}: ${issue.message}`).join(', ');
    super(`검증 실패: ${message}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
  
  static fromZodError(error: import('zod').ZodError): ValidationError {
    const issues = error.issues.map(issue => ({
      path: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    return new ValidationError(issues);
  }
}