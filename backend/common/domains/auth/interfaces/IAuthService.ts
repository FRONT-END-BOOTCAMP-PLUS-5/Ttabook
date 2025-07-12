import { UserForJWT, UserJWTPayload } from '@/lib/jwt';

export interface IAuthService {
  // JWT 토큰 생성 (User entity를 JWT 형태로 변환)
  signAccessToken(user: UserForJWT): Promise<string>;
  signRefreshToken(user: UserForJWT): Promise<string>;
  
  // JWT 토큰 검증 (JWT 페이로드 타입 반환)
  verifyAccessToken(token: string): Promise<UserJWTPayload>;
  verifyRefreshToken(token: string): Promise<UserJWTPayload>;
  
  // 패스워드 관련
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface ICookieService {
  // 쿠키 설정
  setAuthCookies(accessToken: string, refreshToken: string): { accessToken: string; refreshToken: string };
  
  // 쿠키 삭제
  clearAuthCookies(): { accessToken: string; refreshToken: string };
  
  // 쿠키에서 토큰 추출
  extractTokenFromCookies(cookieHeader: string | null, tokenName: string): string | null;
}