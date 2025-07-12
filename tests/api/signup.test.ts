import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Supabase 모킹
const mockSupabaseClient = {
  from: jest.fn(),
};

const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

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

// 패스워드 유틸리티 모킹
const mockHashPassword = jest.fn();

jest.unstable_mockModule('../../lib/password', () => ({
  hashPassword: mockHashPassword,
}));

describe('/api/signup API 라우트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';
    process.env.BCRYPT_ROUNDS = '12';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Mock 체인 설정
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
    });
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/signup', () => {
    const validSignupData = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      name: '홍길동',
    };

    it('유효한 데이터로 회원가입이 성공해야 한다', async () => {
      // Mock 설정
      const hashedPassword = 'hashed_password_123';
      const newUser = {
        id: 'user_123',
        email: validSignupData.email,
        name: validSignupData.name,
        type: 'user',
        created_at: '2024-01-01T00:00:00.000Z',
      };
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      mockHashPassword.mockResolvedValue(hashedPassword);
      mockSingle.mockResolvedValue({
        data: newUser,
        error: null,
      });
      mockSignAccessToken.mockResolvedValue(accessToken);
      mockSignRefreshToken.mockResolvedValue(refreshToken);

      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(validSignupData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        success: true,
        message: '회원가입이 완료되었습니다',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          type: newUser.type,
        },
      });

      // 패스워드 해싱 검증
      expect(mockHashPassword).toHaveBeenCalledWith(validSignupData.password);

      // Supabase 사용자 삽입 검증
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith({
        email: validSignupData.email,
        password: hashedPassword,
        name: validSignupData.name,
        type: 'user',
      });

      // JWT 토큰 생성 검증
      expect(mockSignAccessToken).toHaveBeenCalledWith({
        id: newUser.id,
        email: newUser.email,
        type: newUser.type,
      });
      expect(mockSignRefreshToken).toHaveBeenCalledWith({
        id: newUser.id,
        email: newUser.email,
        type: newUser.type,
      });

      // 쿠키 설정 검증
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=' + accessToken);
      expect(cookies).toContain('refreshToken=' + refreshToken);
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=strict');
    });

    it('이메일이 누락되면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        password: validSignupData.password,
        name: validSignupData.name,
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('이메일');
    });

    it('패스워드가 누락되면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        email: validSignupData.email,
        name: validSignupData.name,
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('패스워드');
    });

    it('이름이 누락되면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        email: validSignupData.email,
        password: validSignupData.password,
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('이름');
    });

    it('잘못된 이메일 형식이면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        email: 'invalid-email',
        password: validSignupData.password,
        name: validSignupData.name,
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('유효한 이메일');
    });

    it('너무 짧은 패스워드면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        email: validSignupData.email,
        password: '123',
        name: validSignupData.name,
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('8자 이상');
    });

    it('빈 이름이면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const invalidData = {
        email: validSignupData.email,
        password: validSignupData.password,
        name: '',
      };

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('이름');
    });

    it('이미 존재하는 이메일이면 409를 반환해야 한다', async () => {
      // Supabase에서 이메일 중복 에러 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });

      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(validSignupData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        error: '이미 사용 중인 이메일입니다',
      });
    });

    it('Supabase 에러가 발생하면 500을 반환해야 한다', async () => {
      // Supabase에서 데이터베이스 에러 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Database connection failed' },
      });

      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(validSignupData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: '서버 오류가 발생했습니다',
      });
    });

    it('잘못된 JSON이면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signup/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signup', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('요청 데이터');
    });
  });
});