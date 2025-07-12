import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Supabase 모킹
const mockSupabaseClient = {
  from: jest.fn(),
};

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('/api/duplicates API 라우트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';
    process.env.BCRYPT_ROUNDS = '12';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Mock 체인 설정
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/duplicates', () => {
    it('이메일이 존재하지 않으면 200을 반환해야 한다', async () => {
      // Supabase에서 사용자가 없음을 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // 사용자 없음
      });

      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates?email=new@example.com');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({
        available: true,
        message: '사용 가능한 이메일입니다',
      });
      
      // Supabase 호출 검증
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('email', 'new@example.com');
    });

    it('이메일이 이미 존재하면 409를 반환해야 한다', async () => {
      // Supabase에서 사용자가 존재함을 시뮬레이션
      mockSingle.mockResolvedValue({
        data: { id: 'existing-user-id' },
        error: null,
      });

      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates?email=existing@example.com');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data).toEqual({
        available: false,
        message: '이미 사용 중인 이메일입니다',
      });
    });

    it('이메일 쿼리 파라미터가 누락되면 400을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: '이메일이 제공되지 않았습니다',
      });
    });

    it('잘못된 이메일 형식이면 400을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates?email=invalid-email');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('유효한 이메일 주소를 입력해주세요');
    });

    it('빈 이메일이면 400을 반환해야 한다', async () => {
      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates?email=');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: '이메일이 제공되지 않았습니다',
      });
    });

    it('Supabase 에러가 발생하면 500을 반환해야 한다', async () => {
      // Supabase에서 데이터베이스 에러 시뮬레이션
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST301' },
      });

      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');
      
      const url = new URL('http://localhost:3000/api/duplicates?email=test@example.com');
      const request = new NextRequest(url);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: '서버 오류가 발생했습니다',
      });
    });

    it('여러 이메일 형식을 올바르게 검증해야 한다', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.kr',
        'test+label@gmail.com',
        'user123@test-domain.com',
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
      ];

      const { GET } = await import('../../app/api/duplicates/(adaptor)/route');

      // 유효한 이메일들 테스트
      for (const email of validEmails) {
        mockSingle.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

        const url = new URL(`http://localhost:3000/api/duplicates?email=${encodeURIComponent(email)}`);
        const request = new NextRequest(url);
        const response = await GET(request);
        
        expect(response.status).toBe(200);
      }

      // 유효하지 않은 이메일들 테스트
      for (const email of invalidEmails) {
        const url = new URL(`http://localhost:3000/api/duplicates?email=${encodeURIComponent(email)}`);
        const request = new NextRequest(url);
        const response = await GET(request);
        
        expect(response.status).toBe(400);
      }
    });
  });
});