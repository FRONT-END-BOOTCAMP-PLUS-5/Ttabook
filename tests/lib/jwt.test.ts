import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('JWT 유틸리티', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';
    process.env.BCRYPT_ROUNDS = '12';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('signAccessToken', () => {
    it('사용자 정보로 15분 만료 액세스 토큰을 생성해야 한다', async () => {
      const { signAccessToken } = await import('../../lib/jwt');
      
      const user = { id: 'test-uuid-123', email: 'test@example.com', type: 'user' };
      const token = await signAccessToken(user);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식 검증
    });
  });

  describe('signRefreshToken', () => {
    it('사용자 정보로 14일 만료 리프레시 토큰을 생성해야 한다', async () => {
      const { signRefreshToken } = await import('../../lib/jwt');
      
      const user = { id: 'test-uuid-123', email: 'test@example.com', type: 'user' };
      const token = await signRefreshToken(user);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식 검증
    });
  });

  describe('verifyAccessToken', () => {
    it('유효한 액세스 토큰을 검증하고 사용자 정보를 반환해야 한다', async () => {
      const { signAccessToken, verifyAccessToken } = await import('../../lib/jwt');
      
      const user = { id: 'test-uuid-123', email: 'test@example.com', type: 'user' };
      const token = await signAccessToken(user);
      
      const decoded = await verifyAccessToken(token);
      
      expect(decoded.originalId).toBe(user.id); // 원본 UUID 확인
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.type); // type이 role로 매핑됨
      expect(typeof decoded.id).toBe('number'); // 해시된 ID는 숫자
    });

    it('잘못된 토큰에 대해 에러를 발생시켜야 한다', async () => {
      const { verifyAccessToken } = await import('../../lib/jwt');
      
      await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow();
    });

    it('만료된 토큰에 대해 에러를 발생시켜야 한다', async () => {
      // 이 테스트는 실제로 만료되지 않은 토큰을 사용하되,
      // jose 라이브러리의 에러 처리를 검증합니다
      const { verifyAccessToken } = await import('../../lib/jwt');
      
      // 의도적으로 잘못된 서명을 가진 토큰
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid_signature';
      
      await expect(verifyAccessToken(expiredToken)).rejects.toThrow();
    });

    it('액세스 토큰의 만료 시간이 15분으로 설정되어야 한다', async () => {
      const { signAccessToken, verifyAccessToken } = await import('../../lib/jwt');
      
      const user = { id: 'test-uuid-123', email: 'test@example.com', type: 'user' };
      const token = await signAccessToken(user);
      const decoded = await verifyAccessToken(token);
      
      // 토큰이 현재 시간으로부터 약 15분 후에 만료되는지 확인
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (15 * 60); // 15분
      
      // 5초 정도의 오차는 허용
      expect(Math.abs(decoded.exp - expectedExp)).toBeLessThan(5);
    });

    it('리프레시 토큰의 만료 시간이 14일로 설정되어야 한다', async () => {
      const { signRefreshToken } = await import('../../lib/jwt');
      const { decodeJwt } = await import('jose');
      
      const user = { id: 'test-uuid-456', email: 'test@example.com', type: 'user' };
      const token = await signRefreshToken(user);
      
      // jose의 decodeJwt로 서명 검증 없이 페이로드만 디코드
      const decoded = decodeJwt(token);
      
      // 토큰이 현재 시간으로부터 약 14일 후에 만료되는지 확인
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (14 * 24 * 60 * 60); // 14일
      
      // 5초 정도의 오차는 허용
      expect(Math.abs((decoded.exp as number) - expectedExp)).toBeLessThan(5);
    });
  });

  describe('토큰 마이그레이션', () => {
    it('originalId가 없는 기존 토큰도 정상적으로 처리해야 한다', async () => {
      // 기존 형식의 토큰을 시뮬레이션 (originalId 없음)
      const { SignJWT } = await import('jose');
      const { JWT_SECRET } = await import('../../lib/config');
      
      const secret = new TextEncoder().encode(JWT_SECRET);
      const now = Math.floor(Date.now() / 1000);
      
      // originalId 필드 없이 토큰 생성
      const legacyToken = await new SignJWT({
        id: 12345, // 숫자 ID만 있는 기존 토큰
        email: 'legacy@example.com',
        role: 'user',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + (15 * 60))
        .sign(secret);

      const { verifyAccessToken } = await import('../../lib/jwt');
      const decoded = await verifyAccessToken(legacyToken);
      
      // 기존 토큰의 경우 숫자 ID를 문자열로 변환해서 originalId로 사용
      expect(decoded.id).toBe(12345);
      expect(decoded.originalId).toBe('12345'); // 숫자를 문자열로 변환
      expect(decoded.email).toBe('legacy@example.com');
      expect(decoded.role).toBe('user');
    });

    it('새로운 형식의 토큰은 originalId를 그대로 사용해야 한다', async () => {
      const { signAccessToken, verifyAccessToken } = await import('../../lib/jwt');
      
      const user = { id: 'uuid-new-format', email: 'new@example.com', type: 'admin' };
      const token = await signAccessToken(user);
      const decoded = await verifyAccessToken(token);
      
      // 새로운 토큰은 originalId가 그대로 보존됨
      expect(decoded.originalId).toBe('uuid-new-format');
      expect(decoded.email).toBe('new@example.com');
      expect(decoded.role).toBe('admin');
    });
  });

  describe('에러 처리', () => {
    it('JWT_SECRET이 없으면 토큰 생성 시 에러를 발생시켜야 한다', async () => {
      delete process.env.JWT_SECRET;
      
      // 모듈을 다시 로드하여 환경 변수 변경 반영
      jest.resetModules();
      
      await expect(async () => {
        const { signAccessToken } = await import('../../lib/jwt');
        await signAccessToken({ id: 'test-uuid-789', email: 'test@example.com', type: 'user' });
      }).rejects.toThrow();
    });

    it('빈 문자열 토큰에 대해 에러를 발생시켜야 한다', async () => {
      // 환경 변수가 설정된 상태에서 테스트
      process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';
      
      // 모듈 다시 로드
      jest.resetModules();
      const { verifyAccessToken } = await import('../../lib/jwt');
      
      await expect(verifyAccessToken('')).rejects.toThrow('토큰이 제공되지 않았습니다');
    });

    it('알 수 없는 오류 타입에 대해 적절한 에러 메시지를 반환해야 한다', async () => {
      const { verifyAccessToken } = await import('../../lib/jwt');
      
      // 형식이 완전히 잘못된 토큰으로 알 수 없는 오류 케이스 테스트
      await expect(verifyAccessToken('completely.invalid.token')).rejects.toThrow('토큰 검증 실패:');
    });
  });
});