// 환경 변수 검증 및 내보내기
export const JWT_SECRET = process.env.JWT_SECRET!;
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS)!;

// 선택적 환경 변수 (기본값 제공)
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || '3000';

// 설정 객체로 내보내기 (편의용)
export const config = {
  JWT_SECRET,
  BCRYPT_ROUNDS,
  NODE_ENV,
  PORT,
} as const;
