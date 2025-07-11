import { authOptions } from "@/backend/common/infrastructures/next-auth/AuthConfig";

// VerifyCredentialsUseCase와 SbUserRepository 모킹
jest.mock('../../../nextauth/usecases/VerifyCredentialsUseCase');
jest.mock('../../../../common/infrastructures/repositories/SbUserRepository');

describe('NextAuth Configuration (Simple)', () => {
  describe('authOptions', () => {
    it('올바른 기본 설정을 가져야 한다', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].name).toBe('Credentials');
      
      expect(authOptions.pages).toEqual({
        signIn: '/user/signin',
      });
      
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.secret).toBe(process.env.NEXTAUTH_SECRET);
    });

    it('credentials provider가 올바른 타입이어야 한다', () => {
      const credentialsProvider = authOptions.providers[0] as unknown as Record<string, unknown>;
      
      // CredentialsProvider는 type과 id를 가져야 함
      expect(credentialsProvider.type).toBe('credentials');
      expect(credentialsProvider.id).toBe('credentials');
    });

    it('authorize 함수가 정의되어야 한다', () => {
      const credentialsProvider = authOptions.providers[0] as unknown as Record<string, unknown>;
      expect(typeof credentialsProvider.authorize).toBe('function');
    });

    it('JWT와 세션 콜백이 정의되어야 한다', () => {
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });
});