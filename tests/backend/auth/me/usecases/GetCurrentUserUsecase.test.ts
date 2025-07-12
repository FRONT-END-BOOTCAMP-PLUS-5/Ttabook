import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetCurrentUserUsecase } from '@/backend/auth/me/usecases/GetCurrentUserUsecase';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { User } from '@/backend/common/domains/entities/User';

// Mock 설정
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

const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GetCurrentUserUsecase', () => {
  let usecase: GetCurrentUserUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new GetCurrentUserUsecase(mockAuthService, mockUserRepository);
  });

  const validAccessToken = 'valid-access-token';
  
  const mockTokenPayload = {
    originalId: 'user-uuid-123',
    email: 'test@example.com',
    role: 'user',
    id: 1,
  };

  const testUser: User = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    type: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('execute - 성공 케이스', () => {
    it('유효한 액세스 토큰으로 사용자 정보를 조회해야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('사용자 정보 조회가 완료되었습니다');
      expect(result.user).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user',
      });
    });

    it('관리자 사용자 정보를 올바르게 조회해야 한다', async () => {
      // Given
      const adminUser: User = { ...testUser, type: 'admin' };
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(adminUser);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      expect(result.user.type).toBe('admin');
      expect(result.user.id).toBe('user-uuid-123');
    });

    it('데이터베이스에서 최신 사용자 정보를 가져와야 한다', async () => {
      // Given - 토큰의 정보와 DB의 정보가 다른 경우
      const updatedUser: User = {
        ...testUser,
        name: 'Updated Name',
        updatedAt: '2024-01-02T00:00:00Z',
      };
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(updatedUser);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      expect(result.user.name).toBe('Updated Name'); // DB에서 가져온 최신 정보
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    });

    it('originalId를 사용하여 사용자를 조회해야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // When
      await usecase.execute(validAccessToken);

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123'); // originalId 사용
    });
  });

  describe('execute - 실패 케이스', () => {
    it('만료된 액세스 토큰 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      const expiredError = new Error('Token expired');
      expiredError.name = 'JWTExpired';
      mockAuthService.verifyAccessToken.mockRejectedValue(expiredError);

      // When & Then
      await expect(usecase.execute(validAccessToken))
        .rejects.toThrow('액세스 토큰이 만료되었습니다. 새로고침하거나 다시 로그인해주세요');

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('유효하지 않은 액세스 토큰 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      const invalidError = new Error('Invalid token');
      mockAuthService.verifyAccessToken.mockRejectedValue(invalidError);

      // When & Then
      await expect(usecase.execute(validAccessToken))
        .rejects.toThrow('유효하지 않은 액세스 토큰입니다');

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('사용자를 찾을 수 없을 때 적절한 에러를 반환해야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(usecase.execute(validAccessToken))
        .rejects.toThrow('사용자 정보를 찾을 수 없습니다');

      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    });

    it('데이터베이스 조회 실패 시 에러를 전파해야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockRejectedValue(new Error('데이터베이스 연결 실패'));

      // When & Then
      await expect(usecase.execute(validAccessToken))
        .rejects.toThrow('데이터베이스 연결 실패');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    });
  });

  describe('보안 검증', () => {
    it('액세스 토큰 검증이 반드시 수행되어야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // When
      await usecase.execute(validAccessToken);

      // Then
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith(validAccessToken);
    });

    it('응답에 민감한 정보가 포함되지 않아야 한다', async () => {
      // Given
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('createdAt');
      expect(result.user).not.toHaveProperty('updatedAt');
      expect(result.user).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
        type: 'user',
      });
    });

    it('토큰에서 추출한 사용자 ID로 데이터베이스를 조회해야 한다', async () => {
      // Given
      const tokenWithDifferentId = { ...mockTokenPayload, originalId: 'different-uuid' };
      mockAuthService.verifyAccessToken.mockResolvedValue(tokenWithDifferentId);
      mockUserRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(usecase.execute(validAccessToken))
        .rejects.toThrow('사용자 정보를 찾을 수 없습니다');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('different-uuid');
    });
  });

  describe('데이터 무결성', () => {
    it('토큰의 이메일과 DB의 이메일이 일치하는지 확인', async () => {
      // Given
      const userWithDifferentEmail: User = { ...testUser, email: 'different@example.com' };
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(userWithDifferentEmail);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      // DB에서 가져온 최신 정보가 우선됨
      expect(result.user.email).toBe('different@example.com');
    });

    it('사용자 정보가 업데이트된 경우 최신 정보를 반환해야 한다', async () => {
      // Given
      const updatedUser: User = {
        ...testUser,
        name: 'New Name',
        type: 'admin', // 권한이 변경됨
        updatedAt: '2024-01-02T00:00:00Z',
      };
      mockAuthService.verifyAccessToken.mockResolvedValue(mockTokenPayload);
      mockUserRepository.findById.mockResolvedValue(updatedUser);

      // When
      const result = await usecase.execute(validAccessToken);

      // Then
      expect(result.user.name).toBe('New Name');
      expect(result.user.type).toBe('admin'); // 최신 권한 정보
    });
  });
});