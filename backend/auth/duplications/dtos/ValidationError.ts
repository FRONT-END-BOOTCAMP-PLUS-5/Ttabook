import { AuthError } from './AuthError';

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