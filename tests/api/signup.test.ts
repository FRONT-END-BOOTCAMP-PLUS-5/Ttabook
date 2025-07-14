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
const mockInsert = jest.fn();
const mockSelect = jest.fn();
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

// 패스워드 유틸리티 모킹
const mockVerifyPassword = jest.fn();
const mockHashPassword = jest.fn();

jest.unstable_mockModule('../../lib/password', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mockHashPassword,
}));

// Clean Architecture 모킹
const mockSignupUsecase = {
  execute: jest.fn(),
};

const mockUserRepository = {};
const mockAuthService = {};
const mockCookieService = {
  setAuthCookies: jest.fn(),
};

jest.unstable_mockModule('../../backend/auth/signup/usecases', () => ({
  SignupUsecase: jest.fn().mockImplementation(() => mockSignupUsecase),
}));

jest.unstable_mockModule('../../backend/auth/signup/dtos', () => ({
  SignupRequestDto: jest
    .fn()
    .mockImplementation((email, password, name) => ({ email, password, name })),
}));

jest.unstable_mockModule(
  '../../backend/common/infrastructures/repositories/SbUserRepository',
  () => ({
    SupabaseUserRepository: jest
      .fn()
      .mockImplementation(() => mockUserRepository),
  })
);

jest.unstable_mockModule('../../backend/common/infrastructures/auth', () => ({
  AuthService: jest.fn().mockImplementation(() => mockAuthService),
  CookieService: jest.fn().mockImplementation(() => mockCookieService),
}));

describe('/api/signup API 라우트', () => {
  beforeEach(() => {
    // Supabase 클라이언트 Mock 체인 설정
    const mockSupabaseClient = {
      from: jest.fn(() => ({
        insert: mockInsert,
        select: mockSelect,
      })),
    };

    mockCreateClient.mockResolvedValue(mockSupabaseClient);

    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  describe('POST /api/signup', () => {
    const validSignupData = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      name: '홍길동',
    };

    it('유효한 데이터로 회원가입이 성공해야 한다', async () => {
      // Mock 설정
      const newUser = {
        id: 'user_123',
        email: validSignupData.email,
        name: validSignupData.name,
        type: 'user',
      };
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      const expectedResult = {
        response: {
          success: true,
          message: '회원가입이 완료되었습니다',
          user: newUser,
        },
        tokens: { accessToken, refreshToken },
      };

      mockSignupUsecase.execute.mockResolvedValue(expectedResult);
      mockCookieService.setAuthCookies.mockReturnValue({
        accessToken: 'access-cookie',
        refreshToken: 'refresh-cookie',
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

      // SignupUsecase가 올바른 데이터로 호출되었는지 검증
      expect(mockSignupUsecase.execute).toHaveBeenCalledWith({
        email: validSignupData.email,
        password: validSignupData.password,
        name: validSignupData.name,
      });

      // 쿠키 서비스 호출 검증
      expect(mockCookieService.setAuthCookies).toHaveBeenCalledWith(
        accessToken,
        refreshToken
      );

      // 쿠키 설정 검증
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('access-cookie');
      expect(cookies).toContain('refresh-cookie');
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
      // SignupUsecase에서 이메일 중복 에러 시뮬레이션
      mockSignupUsecase.execute.mockRejectedValue(
        new Error('이미 사용 중인 이메일입니다')
      );

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

    it('일반적인 서버 에러가 발생하면 500을 반환해야 한다', async () => {
      // 일반적인 서버 에러 시뮬레이션
      mockSignupUsecase.execute.mockRejectedValue(
        new Error('데이터베이스 연결 실패')
      );

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
