import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { NextRequest } from 'next/server';

// Supabase 인프라 모킹
const mockCreateClient = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.unstable_mockModule(
  '../../backend/common/infrastructures/supabase/server',
  () => ({
    createClient: mockCreateClient,
  })
);

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

describe('/api/me API 라우트', () => {
  beforeEach(() => {
    // Supabase 클라이언트 Mock 체인 설정
    const mockSupabaseClient = {
      from: jest.fn(() => ({
        select: mockSelect,
      })),
    };

    mockCreateClient.mockResolvedValue(mockSupabaseClient);

    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  describe('GET /api/me', () => {
    it('유효한 액세스 토큰으로 사용자 정보를 반환해야 한다', async () => {
      // Mock 설정
      const userPayload = {
        id: 123,
        id: 'user_123',
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 900,
        iat: Math.floor(Date.now() / 1000),
      };

      const dbUser = {
        id: 'user_123',
        email: 'user@example.com',
        name: '홍길동',
        type: 'user',
      };

      mockVerifyAccessToken.mockResolvedValue(userPayload);
      mockSingle.mockResolvedValue({
        data: dbUser,
        error: null,
      });

      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'accessToken=valid_access_token_123',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '사용자 정보 조회가 완료되었습니다',
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          type: dbUser.type,
        },
      });

      // JWT 토큰 검증 확인
      expect(mockVerifyAccessToken).toHaveBeenCalledWith(
        'valid_access_token_123'
      );
    });

    it('액세스 토큰이 없으면 401을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '인증이 필요합니다',
      });

      // JWT 검증이 호출되지 않았는지 확인
      expect(mockVerifyAccessToken).not.toHaveBeenCalled();
    });

    it('빈 액세스 토큰이면 401을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'accessToken=',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '인증이 필요합니다',
      });

      expect(mockVerifyAccessToken).not.toHaveBeenCalled();
    });

    it('유효하지 않은 액세스 토큰이면 401을 반환해야 한다', async () => {
      // JWT 검증 실패 시뮬레이션
      mockVerifyAccessToken.mockRejectedValue(new Error('Invalid token'));

      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'accessToken=invalid_token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '유효하지 않은 액세스 토큰입니다',
      });

      expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid_token');
    });

    it('만료된 액세스 토큰이면 401을 반환해야 한다', async () => {
      // JWT 만료 에러 시뮬레이션
      const expiredError = new Error('Token expired');
      expiredError.name = 'JWTExpired';
      mockVerifyAccessToken.mockRejectedValue(expiredError);

      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'accessToken=expired_token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error:
          '액세스 토큰이 만료되었습니다. 새로고침하거나 다시 로그인해주세요',
      });

      expect(mockVerifyAccessToken).toHaveBeenCalledWith('expired_token');
    });

    it('손상된 쿠키 형식이면 401을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'invalidcookieformat',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '인증이 필요합니다',
      });

      expect(mockVerifyAccessToken).not.toHaveBeenCalled();
    });

    it('다른 쿠키가 있지만 accessToken이 없으면 401을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie: 'refreshToken=some_refresh_token; otherCookie=value',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '인증이 필요합니다',
      });

      expect(mockVerifyAccessToken).not.toHaveBeenCalled();
    });

    it('여러 쿠키 중에서 accessToken을 올바르게 추출해야 한다', async () => {
      const userPayload = {
        id: 456,
        id: 'user_456',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 900,
        iat: Math.floor(Date.now() / 1000),
      };

      const dbUser = {
        id: 'user_456',
        email: 'test@example.com',
        name: '관리자',
        type: 'admin',
      };

      mockVerifyAccessToken.mockResolvedValue(userPayload);
      mockSingle.mockResolvedValue({
        data: dbUser,
        error: null,
      });

      const { GET } = await import('../../app/api/me/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/me', {
        headers: {
          Cookie:
            'refreshToken=refresh_123; accessToken=access_456; sessionId=session_789',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '사용자 정보 조회가 완료되었습니다',
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          type: dbUser.type,
        },
      });
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('access_456');
    });
  });
});
