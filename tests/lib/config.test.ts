import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

describe('config.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 환경 변수 초기화
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // 환경 변수 복원
    process.env = originalEnv;
  });

  describe('환경 변수 검증', () => {
    it('JWT_SECRET이 누락되면 에러를 발생시켜야 한다', async () => {
      delete process.env.JWT_SECRET;
      process.env.BCRYPT_ROUNDS = '12';

      await expect(async () => {
        // config 모듈을 다시 import하여 환경 변수 검증 로직 실행
        jest.resetModules();
        await import('../../lib/config');
      }).rejects.toThrow('JWT_SECRET environment variable is required');
    });

    it('BCRYPT_ROUNDS가 누락되면 에러를 발생시켜야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      delete process.env.BCRYPT_ROUNDS;

      await expect(async () => {
        jest.resetModules();
        await import('../../lib/config');
      }).rejects.toThrow('BCRYPT_ROUNDS environment variable is required');
    });

    it('BCRYPT_ROUNDS가 숫자가 아니면 에러를 발생시켜야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = 'not-a-number';

      await expect(async () => {
        jest.resetModules();
        await import('../../lib/config');
      }).rejects.toThrow('BCRYPT_ROUNDS must be a valid number, got: not-a-number');
    });

    it('BCRYPT_ROUNDS가 범위를 벗어나면 에러를 발생시켜야 한다 (너무 작음)', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '3';

      await expect(async () => {
        jest.resetModules();
        await import('../../lib/config');
      }).rejects.toThrow('BCRYPT_ROUNDS must be between 4 and 20 for security and performance, got: 3');
    });

    it('BCRYPT_ROUNDS가 범위를 벗어나면 에러를 발생시켜야 한다 (너무 큼)', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '25';

      await expect(async () => {
        jest.resetModules();
        await import('../../lib/config');
      }).rejects.toThrow('BCRYPT_ROUNDS must be between 4 and 20 for security and performance, got: 25');
    });

    it('BCRYPT_ROUNDS가 유효한 범위 내에 있으면 성공해야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '8';

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.BCRYPT_ROUNDS).toBe(8);
    });

    it('모든 환경 변수가 올바르게 설정되면 성공해야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.JWT_SECRET).toBe('test-secret-key-that-is-long-enough');
      expect(config.BCRYPT_ROUNDS).toBe(12);
    });

    it('NODE_ENV가 설정되지 않으면 기본값 development를 사용해야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';
      delete process.env.NODE_ENV;

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.NODE_ENV).toBe('development');
    });

    it('PORT가 설정되지 않으면 기본값 3000을 사용해야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';
      delete process.env.PORT;

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.PORT).toBe('3000');
    });
  });
});
