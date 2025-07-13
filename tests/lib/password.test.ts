import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Password 유틸리티', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET =
      'test-jwt-secret-for-unit-tests-that-is-long-enough';
    process.env.BCRYPT_ROUNDS = '12';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('hashPassword', () => {
    it('평문 패스워드를 해시화해야 한다', async () => {
      const { hashPassword } = await import('../../lib/password');

      const plainPassword = 'testPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt 해시는 보통 60자
    });

    it('동일한 패스워드라도 매번 다른 해시를 생성해야 한다 (salt)', async () => {
      const { hashPassword } = await import('../../lib/password');

      const plainPassword = 'testPassword123!';
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2);
    });

    it('환경 변수에서 설정된 rounds를 사용해야 한다', async () => {
      process.env.BCRYPT_ROUNDS = '10';

      // 모듈 다시 로드하여 새로운 환경 변수 적용
      const { jest } = await import('@jest/globals');
      jest.resetModules();
      const { hashPassword } = await import('../../lib/password');

      const plainPassword = 'testPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      // bcrypt 해시는 $2b$10$ 형태로 시작 (여기서 10은 rounds)
      expect(hashedPassword).toMatch(/^\$2[axyb]\$10\$/);
    });

    it('빈 문자열 패스워드에 대해 에러를 발생시켜야 한다', async () => {
      const { hashPassword } = await import('../../lib/password');

      await expect(hashPassword('')).rejects.toThrow(
        '패스워드가 제공되지 않았습니다'
      );
    });
  });

  describe('verifyPassword', () => {
    it('올바른 패스워드를 검증해야 한다', async () => {
      const { hashPassword, verifyPassword } = await import(
        '../../lib/password'
      );

      const plainPassword = 'testPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('잘못된 패스워드를 거부해야 한다', async () => {
      const { hashPassword, verifyPassword } = await import(
        '../../lib/password'
      );

      const plainPassword = 'testPassword123!';
      const wrongPassword = 'wrongPassword456!';
      const hashedPassword = await hashPassword(plainPassword);

      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('빈 문자열 패스워드에 대해 에러를 발생시켜야 한다', async () => {
      const { verifyPassword } = await import('../../lib/password');

      const hashedPassword = '$2a$12$validHashExample';

      await expect(verifyPassword('', hashedPassword)).rejects.toThrow(
        '패스워드가 제공되지 않았습니다'
      );
    });

    it('잘못된 해시 포맷에 대해 false를 반환해야 한다', async () => {
      const { verifyPassword } = await import('../../lib/password');

      const plainPassword = 'testPassword123!';
      const invalidHash = 'invalid-hash-format';

      // bcrypt.compare는 잘못된 해시에 대해 false를 반환함
      const result = await verifyPassword(plainPassword, invalidHash);
      expect(result).toBe(false);
    });

    it('빈 해시에 대해 에러를 발생시켜야 한다', async () => {
      const { verifyPassword } = await import('../../lib/password');

      const plainPassword = 'testPassword123!';

      await expect(verifyPassword(plainPassword, '')).rejects.toThrow(
        '해시된 패스워드가 제공되지 않았습니다'
      );
      await expect(verifyPassword(plainPassword, '   ')).rejects.toThrow(
        '해시된 패스워드가 제공되지 않았습니다'
      );
    });
  });

  describe('해시/검증 라운드트립', () => {
    it('해시화 후 검증하는 전체 프로세스가 작동해야 한다', async () => {
      const { hashPassword, verifyPassword } = await import(
        '../../lib/password'
      );

      const testPasswords = [
        'simplePassword',
        'Complex!Password123',
        '한글패스워드!@#',
        'very-long-password-with-many-characters-and-symbols-!@#$%^&*()',
      ];

      for (const password of testPasswords) {
        const hashedPassword = await hashPassword(password);
        const isValid = await verifyPassword(password, hashedPassword);
        expect(isValid).toBe(true);

        // 다른 패스워드로는 검증 실패
        const isInvalid = await verifyPassword(
          password + 'wrong',
          hashedPassword
        );
        expect(isInvalid).toBe(false);
      }
    });
  });

  describe('에러 처리', () => {
    it('BCRYPT_ROUNDS가 설정되지 않으면 에러를 발생시켜야 한다', async () => {
      delete process.env.BCRYPT_ROUNDS;

      const { jest } = await import('@jest/globals');

      await expect(async () => {
        // 모듈 다시 로드하여 환경 변수 변경 반영
        jest.resetModules();
        const { hashPassword } = await import('../../lib/password');
        await hashPassword('testPassword');
      }).rejects.toThrow();
    });
  });
});
