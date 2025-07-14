import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RefreshTokenUsecase } from '@/backend/auth/refresh/usecases/RefreshTokenUsecase';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { RefreshTokenRequestDto } from '@/backend/auth/refresh/dtos';

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

describe('RefreshTokenUsecase', () => {
  let usecase: RefreshTokenUsecase;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new RefreshTokenUsecase(mockAuthService);
  });

  const validRefreshToken = 'valid-refresh-token';
  const refreshRequest = new RefreshTokenRequestDto(validRefreshToken);

  const mockUserPayload = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    type: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  describe('execute - 성공 케이스', () => {
    it('유효한 리프레시 토큰으로 새 토큰들을 생성해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('new-access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('new-refresh-token');

      // When
      const result = await usecase.execute(refreshRequest);

      // Then
      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken
      );
      expect(mockAuthService.signAccessToken).toHaveBeenCalledWith({
        id: 'user-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });
      expect(mockAuthService.signRefreshToken).toHaveBeenCalledWith({
        id: 'user-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });

      expect(result.response.success).toBe(true);
      expect(result.response.message).toBe('토큰이 갱신되었습니다');
      expect(result.tokens).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('관리자 사용자의 토큰을 올바르게 갱신해야 한다', async () => {
      // Given
      const adminPayload = { ...mockUserPayload, type: 'admin' };
      mockAuthService.verifyRefreshToken.mockResolvedValue(adminPayload);
      mockAuthService.signAccessToken.mockResolvedValue('admin-access-token');
      mockAuthService.signRefreshToken.mockResolvedValue('admin-refresh-token');

      // When
      const result = await usecase.execute(refreshRequest);

      // Then
      expect(mockAuthService.signAccessToken).toHaveBeenCalledWith({
        id: 'user-uuid-123',
        email: 'test@example.com',
        type: 'admin',
      });
      expect(result.tokens.accessToken).toBe('admin-access-token');
    });

    it('type 필드를 올바르게 전달해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(refreshRequest);

      // Then
      const tokenPayload = mockAuthService.signAccessToken.mock.calls[0][0];
      expect(tokenPayload.type).toBe('user');
      expect(tokenPayload).not.toHaveProperty('role');
    });

    it('id를 id로 올바르게 매핑해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(refreshRequest);

      // Then
      const tokenPayload = mockAuthService.signAccessToken.mock.calls[0][0];
      expect(tokenPayload.id).toBe('user-uuid-123'); // id → id 매핑 확인
    });
  });

  describe('execute - 실패 케이스', () => {
    it('만료된 리프레시 토큰 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      const expiredError = new Error('Token expired');
      expiredError.name = 'JWTExpired';
      mockAuthService.verifyRefreshToken.mockRejectedValue(expiredError);

      // When & Then
      await expect(usecase.execute(refreshRequest)).rejects.toThrow(
        '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요'
      );

      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken
      );
      expect(mockAuthService.signAccessToken).not.toHaveBeenCalled();
    });

    it('유효하지 않은 리프레시 토큰 시 적절한 에러 메시지를 반환해야 한다', async () => {
      // Given
      const invalidError = new Error('Invalid token');
      mockAuthService.verifyRefreshToken.mockRejectedValue(invalidError);

      // When & Then
      await expect(usecase.execute(refreshRequest)).rejects.toThrow(
        '유효하지 않은 리프레시 토큰입니다'
      );

      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken
      );
      expect(mockAuthService.signAccessToken).not.toHaveBeenCalled();
    });

    it('새 액세스 토큰 생성 실패 시 에러를 전파해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockRejectedValue(
        new Error('토큰 생성 실패')
      );

      // When & Then
      await expect(usecase.execute(refreshRequest)).rejects.toThrow(
        '토큰 생성 실패'
      );

      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalled();
      expect(mockAuthService.signAccessToken).toHaveBeenCalled();
    });

    it('새 리프레시 토큰 생성 실패 시 에러를 전파해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('new-access-token');
      mockAuthService.signRefreshToken.mockRejectedValue(
        new Error('리프레시 토큰 생성 실패')
      );

      // When & Then
      await expect(usecase.execute(refreshRequest)).rejects.toThrow(
        '리프레시 토큰 생성 실패'
      );

      expect(mockAuthService.signAccessToken).toHaveBeenCalled();
      expect(mockAuthService.signRefreshToken).toHaveBeenCalled();
    });
  });

  describe('보안 검증', () => {
    it('리프레시 토큰 검증이 반드시 수행되어야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(refreshRequest);

      // Then
      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockAuthService.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken
      );
    });

    it('새 토큰 페이로드에 민감한 정보가 포함되지 않아야 한다', async () => {
      // Given
      const payloadWithSensitiveData = {
        ...mockUserPayload,
        password: 'hashed-password',
        createdAt: '2024-01-01',
      };
      mockAuthService.verifyRefreshToken.mockResolvedValue(
        payloadWithSensitiveData
      );
      mockAuthService.signAccessToken.mockResolvedValue('token');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(refreshRequest);

      // Then
      const newTokenPayload = mockAuthService.signAccessToken.mock.calls[0][0];
      expect(newTokenPayload).not.toHaveProperty('password');
      expect(newTokenPayload).not.toHaveProperty('createdAt');
      expect(newTokenPayload).toEqual({
        id: 'user-uuid-123',
        email: 'test@example.com',
        type: 'user',
      });
    });

    it('동일한 페이로드로 액세스와 리프레시 토큰을 생성해야 한다', async () => {
      // Given
      mockAuthService.verifyRefreshToken.mockResolvedValue(mockUserPayload);
      mockAuthService.signAccessToken.mockResolvedValue('access');
      mockAuthService.signRefreshToken.mockResolvedValue('refresh');

      // When
      await usecase.execute(refreshRequest);

      // Then
      const accessTokenPayload =
        mockAuthService.signAccessToken.mock.calls[0][0];
      const refreshTokenPayload =
        mockAuthService.signRefreshToken.mock.calls[0][0];
      expect(accessTokenPayload).toEqual(refreshTokenPayload);
    });
  });

});
