import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SignupUsecase } from '@/backend/auth/signup/usecases/SignupUsecase';
import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { SignupRequestDto } from '@/backend/auth/signup/dtos';
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

describe('SignupUsecase', () => {
  let usecase: SignupUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new SignupUsecase(mockUserRepository, mockAuthService);
  });

  const signupRequest = new SignupRequestDto('test@example.com', 'password123', 'Test User');

  const createdUser: User = {
    id: 'new-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    type: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('execute - 성공 케이스', () => {
    it('새로운 사용자 회원가입이 성공해야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null); // 이메일 중복 없음
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAuthService.signAccessToken.mockResolvedValue('access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh-token');

      // When
      const result = await usecase.execute(signupRequest);

      // Then
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        type: 'user',
      });

      expect(result.response.success).toBe(true);
      expect(result.response.message).toBe('회원가입이 완료되었습니다');
      expect(result.response.user).toEqual({
        id: 'new-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user',
      });
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
    });

    it('JWT 토큰이 올바른 페이로드로 생성되어야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAuthService.signAccessToken.mockResolvedValue('access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh-token');

      // When
      await usecase.execute(signupRequest);

      // Then
      const expectedTokenPayload = {
        id: 'new-uuid-123',
        email: 'test@example.com',
        type: 'user',
      };
      expect(mockAuthService.signAccessToken).toHaveBeenCalledWith(expectedTokenPayload);
      expect(mockAuthService.signRefreshToken).toHaveBeenCalledWith(expectedTokenPayload);
    });
  });

  describe('execute - 실패 케이스', () => {
    it('이미 존재하는 이메일로 회원가입 시 에러가 발생해야 한다', async () => {
      // Given
      const existingUser: User = {
        id: 'existing-uuid',
        email: 'test@example.com',
        name: 'Existing User',
        password: 'existing-password',
        type: 'user',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // When & Then
      await expect(usecase.execute(signupRequest)).rejects.toThrow('이미 사용 중인 이메일입니다');
      
      // 패스워드 해싱이나 사용자 저장이 호출되지 않아야 함
      expect(mockAuthService.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('패스워드 해싱 실패 시 에러가 전파되어야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockRejectedValue(new Error('패스워드 해싱 실패'));

      // When & Then
      await expect(usecase.execute(signupRequest)).rejects.toThrow('패스워드 해싱 실패');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('사용자 저장 실패 시 에러가 전파되어야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockRejectedValue(new Error('데이터베이스 저장 실패'));

      // When & Then
      await expect(usecase.execute(signupRequest)).rejects.toThrow('데이터베이스 저장 실패');
      expect(mockAuthService.signAccessToken).not.toHaveBeenCalled();
    });

    it('JWT 토큰 생성 실패 시 에러가 전파되어야 한다', async () => {
      // Given
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAuthService.signAccessToken.mockRejectedValue(new Error('JWT 생성 실패'));

      // When & Then
      await expect(usecase.execute(signupRequest)).rejects.toThrow('JWT 생성 실패');
    });
  });

  describe('의존성 주입 검증', () => {
    it('UserRepository가 올바르게 주입되어야 한다', () => {
      expect(usecase['userRepository']).toBe(mockUserRepository);
    });

    it('IAuthService가 올바르게 주입되어야 한다', () => {
      expect(usecase['authService']).toBe(mockAuthService);
    });
  });
});