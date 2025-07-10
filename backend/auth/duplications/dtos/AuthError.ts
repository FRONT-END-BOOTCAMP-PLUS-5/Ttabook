// 인증 도메인 특화 에러들의 기본 클래스
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}