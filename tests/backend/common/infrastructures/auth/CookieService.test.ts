import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CookieService } from '@/backend/common/infrastructures/auth/CookieService';

describe('CookieService', () => {
  const originalEnv = process.env;
  let cookieService: CookieService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    cookieService = new CookieService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('인증 쿠키 설정', () => {
    it('액세스 토큰과 리프레시 토큰 쿠키를 올바르게 생성해야 한다', () => {
      const accessToken = 'access.token.here';
      const refreshToken = 'refresh.token.here';

      const cookies = cookieService.setAuthCookies(accessToken, refreshToken);

      expect(cookies.accessToken).toContain('accessToken=access.token.here');
      expect(cookies.accessToken).toContain('HttpOnly');
      expect(cookies.accessToken).toContain('SameSite=strict');
      expect(cookies.accessToken).toContain('Path=/');
      expect(cookies.accessToken).toContain('Max-Age=900'); // 15분 = 900초

      expect(cookies.refreshToken).toContain('refreshToken=refresh.token.here');
      expect(cookies.refreshToken).toContain('HttpOnly');
      expect(cookies.refreshToken).toContain('SameSite=strict');
      expect(cookies.refreshToken).toContain('Path=/');
      expect(cookies.refreshToken).toContain('Max-Age=1209600'); // 14일 = 1209600초
    });

    it('프로덕션 환경에서 Secure 플래그를 추가해야 한다', () => {
      process.env.NODE_ENV = 'production';
      
      const accessToken = 'access.token.secure';
      const refreshToken = 'refresh.token.secure';

      const cookies = cookieService.setAuthCookies(accessToken, refreshToken);

      expect(cookies.accessToken).toContain('Secure');
      expect(cookies.refreshToken).toContain('Secure');
    });

    it('개발 환경에서 Secure 플래그를 추가하지 않아야 한다', () => {
      process.env.NODE_ENV = 'development';
      
      const accessToken = 'access.token.dev';
      const refreshToken = 'refresh.token.dev';

      const cookies = cookieService.setAuthCookies(accessToken, refreshToken);

      expect(cookies.accessToken).not.toContain('Secure');
      expect(cookies.refreshToken).not.toContain('Secure');
    });
  });

  describe('인증 쿠키 삭제', () => {
    it('액세스 토큰과 리프레시 토큰 쿠키를 만료시켜야 한다', () => {
      const cookies = cookieService.clearAuthCookies();

      expect(cookies.accessToken).toContain('accessToken=');
      expect(cookies.accessToken).toContain('Max-Age=0');
      
      expect(cookies.refreshToken).toContain('refreshToken=');
      expect(cookies.refreshToken).toContain('Max-Age=0');
    });
  });

  describe('쿠키에서 토큰 추출', () => {
    it('쿠키 헤더에서 액세스 토큰을 추출해야 한다', () => {
      const cookieHeader = 'accessToken=access.token.value; refreshToken=refresh.token.value; otherCookie=other';
      
      const accessToken = cookieService.extractTokenFromCookies(cookieHeader, 'accessToken');
      expect(accessToken).toBe('access.token.value');
    });

    it('쿠키 헤더에서 리프레시 토큰을 추출해야 한다', () => {
      const cookieHeader = 'accessToken=access.token.value; refreshToken=refresh.token.value; otherCookie=other';
      
      const refreshToken = cookieService.extractTokenFromCookies(cookieHeader, 'refreshToken');
      expect(refreshToken).toBe('refresh.token.value');
    });

    it('존재하지 않는 토큰에 대해 null을 반환해야 한다', () => {
      const cookieHeader = 'accessToken=access.token.value; otherCookie=other';
      
      const missingToken = cookieService.extractTokenFromCookies(cookieHeader, 'refreshToken');
      expect(missingToken).toBeNull();
    });

    it('빈 쿠키 헤더에 대해 null을 반환해야 한다', () => {
      const accessToken = cookieService.extractTokenFromCookies('', 'accessToken');
      expect(accessToken).toBeNull();
      
      const refreshToken = cookieService.extractTokenFromCookies(null, 'refreshToken');
      expect(refreshToken).toBeNull();
    });

    it('공백이 포함된 쿠키 헤더를 올바르게 파싱해야 한다', () => {
      const cookieHeader = ' accessToken = access.token.with.spaces ; refreshToken = refresh.token.spaces ';
      
      const accessToken = cookieService.extractTokenFromCookies(cookieHeader, 'accessToken');
      expect(accessToken).toBe('access.token.with.spaces');
      
      const refreshToken = cookieService.extractTokenFromCookies(cookieHeader, 'refreshToken');
      expect(refreshToken).toBe('refresh.token.spaces');
    });

    it('값이 빈 쿠키에 대해 null을 반환해야 한다', () => {
      const cookieHeader = 'accessToken=; refreshToken=refresh.token.value';
      
      const emptyToken = cookieService.extractTokenFromCookies(cookieHeader, 'accessToken');
      expect(emptyToken).toBeNull();
    });
  });
});