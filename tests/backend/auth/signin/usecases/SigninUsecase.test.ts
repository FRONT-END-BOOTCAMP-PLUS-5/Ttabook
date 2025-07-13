import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SigninUsecase } from '@/backend/auth/signin/usecases/SigninUsecase';
import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { SigninRequestDto } from '@/backend/auth/signin/dtos';
import { User } from '@/backend/common/domains/entities/User';

// Mock 설정
const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAuthService: jest.Mocked<IAuthService> = {
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(),
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
  extractTokenFromCookies: jest.fn(),
};

describe('SigninUsecase', () => {
  let usecase: SigninUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new SigninUsecase(mockUserRepository, mockAuthService);
  });

  const testUser: User = {
    id: 'test-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    type: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const signinRequest = new SigninRequestDto('test@example.com', 'password123');

  describe('execute - 성공 케이스', () => {
    it('유효한 자격증명으로 로그인이 성공해야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.signAccessToken.mockResolvedValue('access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh-token');

      // When
      const result = await usecase.execute(signinRequest);

      // Then
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockAuthService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );
      expect(mockAuthService.signAccessToken).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });
      expect(mockAuthService.signRefreshToken).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });

      expect(result.response.success).toBe(true);
      expect(result.response.message).toBe('로그인이 완료되었습니다');
      expect(result.response.user).toEqual({
        id: 'test-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user',
      });
      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('관리자 사용자로 로그인이 성공해야 한다', async () => {
      // Given
      const adminUser: User = { ...testUser, type: 'admin' };
      mockUserRepository.findByEmail.mockResolvedValue(adminUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.signAccessToken.mockResolvedValue('admin-access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('admin-refresh-token');

      // When
      const result = await usecase.execute(signinRequest);

      // Then
      expect(mockAuthService.signAccessToken).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        email: 'test@example.com',
        type: 'admin',
      });
      expect(result.response.user.type).toBe('admin');
      expect(result.tokens.accessToken).toBe('admin-access-token');
    });
  });

  describe('execute - 실패 케이스', () => {
    it('존재하지 않는 이메일로 로그인 시 에러를 발생시켜야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // When & Then
      await expect(usecase.execute(signinRequest)).rejects.toThrow(
        '이메일 또는 패스워드가 올바르지 않습니다'
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockAuthService.verifyPassword).not.toHaveBeenCalled();
      expect(mockAuthService.signAccessToken).not.toHaveBeenCalled();
    });

    it('잘못된 패스워드로 로그인 시 에러를 발생시켜야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.verifyPassword.mockResolvedValue(false);

      // When & Then
      await expect(usecase.execute(signinRequest)).rejects.toThrow(
        '이메일 또는 패스워드가 올바르지 않습니다'
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockAuthService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );
      expect(mockAuthService.signAccessToken).not.toHaveBeenCalled();
    });

    it('토큰 생성 실패 시 에러를 전파해야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.signAccessToken.mockRejectedValue(
        new Error('토큰 생성 실패')
      );

      // When & Then
      await expect(usecase.execute(signinRequest)).rejects.toThrow(
        '토큰 생성 실패'
      );

      expect(mockAuthService.signAccessToken).toHaveBeenCalled();
    });

    it('데이터베이스 조회 실패 시 에러를 전파해야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('데이터베이스 연결 실패')
      );

      // When & Then
      await expect(usecase.execute(signinRequest)).rejects.toThrow(
        '데이터베이스 연결 실패'
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });
  });

  describe('보안 검증', () => {
    it('패스워드 검증이 반드시 수행되어야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(signinRequest);

      // Then
      expect(mockAuthService.verifyPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );
    });

    it('토큰 페이로드에 민감한 정보가 포함되지 않아야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(signinRequest);

      // Then
      const tokenPayload = mockAuthService.signAccessToken.mock.calls[0][0];
      expect(tokenPayload).not.toHaveProperty('password');
      expect(tokenPayload).not.toHaveProperty('createdAt');
      expect(tokenPayload).not.toHaveProperty('updatedAt');
      expect(tokenPayload).toEqual({
        id: 'test-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });
    });
  });
});
