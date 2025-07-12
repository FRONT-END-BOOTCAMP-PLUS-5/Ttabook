import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('/api/logout API 라우트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/logout', () => {
    it('로그아웃 시 쿠키를 지우고 성공 메시지를 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/logout/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          Cookie: 'accessToken=some_access_token; refreshToken=some_refresh_token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '로그아웃이 완료되었습니다',
      });

      // 쿠키 삭제 확인
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=;');
      expect(cookies).toContain('refreshToken=;');
      expect(cookies).toContain('Max-Age=0');
      expect(cookies).toContain('HttpOnly');
      expect(cookies).toContain('SameSite=strict');
    });

    it('쿠키가 없어도 로그아웃 성공을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/logout/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '로그아웃이 완료되었습니다',
      });

      // 쿠키 삭제 헤더가 여전히 설정되어야 함
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=;');
      expect(cookies).toContain('refreshToken=;');
    });

    it('잘못된 토큰이 있어도 로그아웃 성공을 반환해야 한다', async () => {
      const { POST } = await import('../../app/api/logout/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          Cookie: 'accessToken=invalid_token; refreshToken=invalid_token',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: '로그아웃이 완료되었습니다',
      });

      // 쿠키 삭제 확인
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=;');
      expect(cookies).toContain('refreshToken=;');
    });

    it('부분적인 쿠키만 있어도 모든 인증 쿠키를 지워야 한다', async () => {
      const { POST } = await import('../../app/api/logout/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          Cookie: 'accessToken=some_token; otherCookie=value',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // 인증 관련 쿠키가 모두 삭제되어야 함
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=;');
      expect(cookies).toContain('refreshToken=;');
      expect(cookies).toContain('Max-Age=0');
    });

    it('다양한 쿠키 형식에서도 올바르게 작동해야 한다', async () => {
      const { POST } = await import('../../app/api/logout/(adaptor)/route');

      const request = new NextRequest('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          Cookie: 'sessionId=abc123; accessToken=token123; theme=dark; refreshToken=refresh456',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // 인증 쿠키만 삭제되고 다른 쿠키는 영향받지 않아야 함
      const cookies = response.headers.get('Set-Cookie');
      expect(cookies).toContain('accessToken=;');
      expect(cookies).toContain('refreshToken=;');
      // 다른 쿠키(sessionId, theme)는 삭제되지 않음
      expect(cookies).not.toContain('sessionId=;');
      expect(cookies).not.toContain('theme=;');
    });
  });
});