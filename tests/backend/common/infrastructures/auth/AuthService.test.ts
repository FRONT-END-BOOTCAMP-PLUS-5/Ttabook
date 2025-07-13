import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '@/backend/common/infrastructures/auth/AuthService';
import { UserForJWT } from '@/lib/jwt';

describe('AuthService', () => {
  const originalEnv = process.env;
  let authService: AuthService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET =
      'test-jwt-secret-for-unit-tests-that-is-long-enough';
    process.env.BCRYPT_ROUNDS = '12';
    authService = new AuthService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('JWT 토큰 생성', () => {
    const testUser: UserForJWT = {
      id: 'test-uuid-123',
      email: 'test@example.com',
      type: 'user',
    };

    it('액세스 토큰을 정상적으로 생성해야 한다', async () => {
      const token = await authService.signAccessToken(testUser);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식
    });

    it('리프레시 토큰을 정상적으로 생성해야 한다', async () => {
      const token = await authService.signRefreshToken(testUser);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 형식
    });
  });

  describe('JWT 토큰 검증', () => {
    it('유효한 액세스 토큰을 검증해야 한다', async () => {
      const testUser: UserForJWT = {
        id: 'test-uuid-456',
        email: 'verify@example.com',
        type: 'admin',
      };

      const token = await authService.signAccessToken(testUser);
      const decoded = await authService.verifyAccessToken(token);

      expect(decoded.originalId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.type); // type이 role로 매핑됨
      expect(typeof decoded.id).toBe('number'); // 해시된 ID
    });

    it('유효한 리프레시 토큰을 검증해야 한다', async () => {
      const testUser: UserForJWT = {
        id: 'test-uuid-789',
        email: 'refresh@example.com',
        type: 'user',
      };

      const token = await authService.signRefreshToken(testUser);
      const decoded = await authService.verifyRefreshToken(token);

      expect(decoded.originalId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.type);
    });

    it('잘못된 토큰에 대해 에러를 발생시켜야 한다', async () => {
      await expect(
        authService.verifyAccessToken('invalid.token')
      ).rejects.toThrow();
      await expect(
        authService.verifyRefreshToken('invalid.token')
      ).rejects.toThrow();
    });
  });

  describe('패스워드 검증', () => {
    it('올바른 패스워드를 검증해야 한다', async () => {
      const { hashPassword } = await import('@/lib/password');

      const plainPassword = 'testPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await authService.verifyPassword(
        plainPassword,
        hashedPassword
      );
      expect(isValid).toBe(true);
    });

    it('틀린 패스워드를 거부해야 한다', async () => {
      const { hashPassword } = await import('@/lib/password');

      const plainPassword = 'testPassword123!';
      const wrongPassword = 'wrongPassword456!';
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await authService.verifyPassword(
        wrongPassword,
        hashedPassword
      );
      expect(isValid).toBe(false);
    });
  });
});
