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
  // Mock the interfaces as well
  UserJWTPayload: {},
  UserForJWT: {},
}));

// 패스워드 유틸리티 모킹
const mockVerifyPassword = jest.fn();
const mockHashPassword = jest.fn();

jest.unstable_mockModule('../../lib/password', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mockHashPassword,
}));

describe('/api/signin API 라우트', () => {
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

  describe('POST /api/signin', () => {
    const validSigninData = {
      email: 'user@example.com',
      password: 'SecurePassword123!',
    };

    it('유효한 자격증명으로 로그인이 성공해야 한다', async () => {
      // Mock 설정
      const existingUser = {
        id: 'user_123',
        email: validSigninData.email,
        password: 'hashed_password_123',
        name: '홍길동',
        type: 'user',
      };
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      mockSingle.mockResolvedValue({
        data: existingUser,
        error: null,
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignAccessToken.mockResolvedValue(accessToken);
      mockSignRefreshToken.mockResolvedValue(refreshToken);

      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signin', {
        method: 'POST',
        body: JSON.stringify(validSigninData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '로그인이 완료되었습니다',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          type: existingUser.type,
        },
      });

      // Supabase 인프라 사용 검증
      expect(mockCreateClient).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalledWith('*'); // Clean architecture uses select('*')
      expect(mockEq).toHaveBeenCalledWith('email', validSigninData.email);

      // 패스워드 검증 확인
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        validSigninData.password,
        existingUser.password
      );

      // JWT 토큰 생성 검증
      expect(mockSignAccessToken).toHaveBeenCalledWith({
        id: existingUser.id,
        email: existingUser.email,
        type: existingUser.type,
      });
      expect(mockSignRefreshToken).toHaveBeenCalledWith({
        id: existingUser.id,
        email: existingUser.email,
        type: existingUser.type,
      });

      // 쿠키 설정 검증
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=' + accessToken);
      expect(cookies).toContain('refreshToken=' + refreshToken);
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=strict');
    });

    it('이메일이 누락되면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const invalidData = {
        password: validSigninData.password,
      };

      const request = new NextRequest('http://localhost:3000/api/signin', {
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
      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const invalidData = {
        email: validSigninData.email,
      };

      const request = new NextRequest('http://localhost:3000/api/signin', {
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

    it('잘못된 이메일 형식이면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const invalidData = {
        email: 'invalid-email',
        password: validSigninData.password,
      };

      const request = new NextRequest('http://localhost:3000/api/signin', {
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

    it('존재하지 않는 이메일이면 401을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // 사용자가 존재하지 않음을 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // 사용자 없음
      });

      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signin', {
        method: 'POST',
        body: JSON.stringify(validSigninData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 이메일 불일치 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Signin error:',
        expect.objectContaining({
          message: '이메일 또는 패스워드가 올바르지 않습니다',
        })
      );

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '이메일 또는 패스워드가 올바르지 않습니다',
      });
    });

    it('잘못된 패스워드면 401을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      const existingUser = {
        id: 'user_123',
        email: validSigninData.email,
        password: 'hashed_password_123',
        name: '홍길동',
        type: 'user',
      };

      mockSingle.mockResolvedValue({
        data: existingUser,
        error: null,
      });
      mockVerifyPassword.mockResolvedValue(false); // 패스워드 불일치

      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signin', {
        method: 'POST',
        body: JSON.stringify(validSigninData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 패스워드 불일치 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Signin error:',
        expect.objectContaining({
          message: '이메일 또는 패스워드가 올바르지 않습니다',
        })
      );

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: '이메일 또는 패스워드가 올바르지 않습니다',
      });
    });

    it('Supabase 에러가 발생하면 500을 반환해야 한다', async () => {
      // console.error 모킹 및 캡처
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // Supabase에서 데이터베이스 에러 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Database connection failed' },
      });

      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signin', {
        method: 'POST',
        body: JSON.stringify(validSigninData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // console.error 복원
      console.error = originalConsoleError;

      // 에러 로그 검증 - 데이터베이스 에러가 로깅되었는지 확인
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Signin error:',
        expect.objectContaining({
          message: expect.stringContaining('사용자 조회 중 오류 발생'),
        })
      );

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: '서버 오류가 발생했습니다',
      });
    });

    it('잘못된 JSON이면 400을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/signin/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/signin', {
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
