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

  describe('환경 변수 내보내기', () => {
    it('JWT_SECRET을 올바르게 내보내야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.JWT_SECRET).toBe('test-secret-key-that-is-long-enough');
    });

    it('BCRYPT_ROUNDS를 숫자로 변환하여 내보내야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = '12';

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.BCRYPT_ROUNDS).toBe(12);
    });

    it('BCRYPT_ROUNDS가 숫자가 아니면 NaN을 반환해야 한다', async () => {
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough';
      process.env.BCRYPT_ROUNDS = 'not-a-number';

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.BCRYPT_ROUNDS).toBeNaN();
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
      const tempEnv = { ...process.env };
      process.env = {
        JWT_SECRET: 'test-secret-key-that-is-long-enough',
        BCRYPT_ROUNDS: '12',
      };

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.NODE_ENV).toBe('development');
      
      process.env = tempEnv;
    });

    it('PORT가 설정되지 않으면 기본값 3000을 사용해야 한다', async () => {
      const tempEnv = { ...process.env };
      process.env = {
        JWT_SECRET: 'test-secret-key-that-is-long-enough',
        BCRYPT_ROUNDS: '12',
      };

      jest.resetModules();
      const config = await import('../../lib/config');
      expect(config.PORT).toBe('3000');
      
      process.env = tempEnv;
    });
  });
});
