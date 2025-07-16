/**
 * 환경 변수 검증 및 설정 관리
 * 애플리케이션 실행 시 필수 환경 변수들이 올바르게 설정되었는지 검증합니다.
 */

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function validateNumberEnvVar(name: string, value: string | undefined): number {
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }

  // BCRYPT_ROUNDS specific validation
  if (name === 'BCRYPT_ROUNDS') {
    if (numValue < 4 || numValue > 20) {
      throw new Error(`${name} must be between 4 and 20 for security and performance, got: ${numValue}`);
    }
  }

  return numValue;
}

// 환경 변수 검증 및 내보내기
export const JWT_SECRET = validateEnvVar('JWT_SECRET', process.env.JWT_SECRET);
export const BCRYPT_ROUNDS = validateNumberEnvVar(
  'BCRYPT_ROUNDS',
  process.env.BCRYPT_ROUNDS
);

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
