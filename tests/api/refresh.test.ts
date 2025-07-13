import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { NextRequest } from 'next/server';

// JWT 유틸리티 모킹
const mockSignAccessToken = jest.fn();
const mockSignRefreshToken = jest.fn();
const mockVerifyAccessToken = jest.fn();
const mockVerifyRefreshToken = jest.fn();

jest.unstable_mockModule('../../lib/jwt', () => ({
  signAccessToken: mockSignAccessToken,
  signRefreshToken: mockSignRefreshToken,
  verifyAccessToken: mockVerifyAccessToken,
  verifyRefreshToken: mockVerifyRefreshToken,
  UserJWTPayload: {},
  UserForJWT: {},
}));

describe('/api/refresh API 라우트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET =
      'test-jwt-secret-for-unit-tests-that-is-long-enough';

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/refresh', () => {
    it('유효한 리프레시 토큰으로 새로운 액세스 토큰을 발급해야 한다', async () => {
      // Mock 설정 - JWT payload 형식
      const userPayload = {
        id: 123, // number ID in JWT
        originalId: 'user_123', // original UUID string
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };
      const newAccessToken = 'new_access_token_123';
      const newRefreshToken = 'new_refresh_token_123';

      mockVerifyRefreshToken.mockResolvedValue(userPayload);
      mockSignAccessToken.mockResolvedValue(newAccessToken);
      mockSignRefreshToken.mockResolvedValue(newRefreshToken);

      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=valid_refresh_token_123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '토큰이 갱신되었습니다',
      });

      // JWT 토큰 검증 및 생성 확인
      expect(mockVerifyRefreshToken).toHaveBeenCalledWith(
        'valid_refresh_token_123'
      );
      expect(mockSignAccessToken).toHaveBeenCalledWith({
        id: userPayload.originalId, // Use original UUID string
        email: userPayload.email,
        type: userPayload.role, // Map role to type
      });
      expect(mockSignRefreshToken).toHaveBeenCalledWith({
        id: userPayload.originalId, // Use original UUID string
        email: userPayload.email,
        type: userPayload.role, // Map role to type
      });

      // 새로운 쿠키 설정 확인
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=' + newAccessToken);
      expect(cookies).toContain('refreshToken=' + newRefreshToken);
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=strict');
    });

    it('리프레시 토큰이 없으면 401을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '리프레시 토큰이 필요합니다',
      });

      // JWT 검증이 호출되지 않았는지 확인
      expect(mockVerifyRefreshToken).not.toHaveBeenCalled();
    });

    it('빈 리프레시 토큰이면 401을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '리프레시 토큰이 필요합니다',
      });

      expect(mockVerifyRefreshToken).not.toHaveBeenCalled();
    });

    it('유효하지 않은 리프레시 토큰이면 401을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // JWT 검증 실패 시뮬레이션
      mockVerifyRefreshToken.mockRejectedValue(
        new Error('Invalid refresh token')
      );

      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=invalid_token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 유효하지 않은 토큰 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'RefreshToken error:',
        expect.objectContaining({
          message: '유효하지 않은 리프레시 토큰입니다',
        })
      );

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '유효하지 않은 리프레시 토큰입니다',
      });

      expect(mockVerifyRefreshToken).toHaveBeenCalledWith('invalid_token');
    });

    it('만료된 리프레시 토큰이면 401을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // JWT 만료 에러 시뮬레이션
      const expiredError = new Error('Refresh token expired');
      expiredError.name = 'JWTExpired';
      mockVerifyRefreshToken.mockRejectedValue(expiredError);

      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=expired_token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 만료된 토큰 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'RefreshToken error:',
        expect.objectContaining({
          message: '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요',
        })
      );

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요',
      });

      expect(mockVerifyRefreshToken).toHaveBeenCalledWith('expired_token');
    });

    it('여러 쿠키 중에서 refreshToken을 올바르게 추출해야 한다', async () => {
      const userPayload = {
        id: 'user_456',
        email: 'test@example.com',
        role: 'admin',
      };
      const newAccessToken = 'access_456';
      const newRefreshToken = 'refresh_456';

      mockVerifyRefreshToken.mockResolvedValue(userPayload);
      mockSignAccessToken.mockResolvedValue(newAccessToken);
      mockSignRefreshToken.mockResolvedValue(newRefreshToken);

      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie:
            'sessionId=session_123; refreshToken=refresh_456; accessToken=old_access_789',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockVerifyRefreshToken).toHaveBeenCalledWith('refresh_456');
    });

    it('액세스 토큰만 있고 리프레시 토큰이 없으면 401을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'accessToken=some_access_token; sessionId=123',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '리프레시 토큰이 필요합니다',
      });

      expect(mockVerifyRefreshToken).not.toHaveBeenCalled();
    });

    it('토큰 생성 중 에러가 발생하면 500을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      const userPayload = {
        id: 'user_123',
        email: 'user@example.com',
        role: 'user',
      };

      mockVerifyRefreshToken.mockResolvedValue(userPayload);
      mockSignAccessToken.mockRejectedValue(
        new Error('Token generation failed')
      );

      const { POST } = await import('../../app/api/refresh/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refreshToken=valid_token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 토큰 생성 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'RefreshToken error:',
        expect.objectContaining({
          message: 'Token generation failed',
        })
      );

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: '서버 오류가 발생했습니다',
      });
    });
  });
});
