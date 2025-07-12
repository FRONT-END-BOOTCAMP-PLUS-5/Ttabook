import { ICookieService } from '../../domains/auth/interfaces/IAuthService';

export class CookieService implements ICookieService {
  setAuthCookies(accessToken: string, refreshToken: string): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.createCookieString('accessToken', accessToken, 15 * 60), // 15분
      refreshToken: this.createCookieString('refreshToken', refreshToken, 14 * 24 * 60 * 60), // 14일
    };
  }

  clearAuthCookies(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.createCookieString('accessToken', '', 0), // 즉시 만료
      refreshToken: this.createCookieString('refreshToken', '', 0), // 즉시 만료
    };
  }

  extractTokenFromCookies(cookieHeader: string | null, tokenName: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookiePairs = cookieHeader.split(';');
    
    for (const pair of cookiePairs) {
      const [cookieName, cookieValue] = pair.trim().split('=');
      if (cookieName === tokenName) {
        return cookieValue || null;
      }
    }
    
    return null;
  }

  private createCookieString(name: string, value: string, maxAge: number): string {
    const cookieOptions = [
      `${name}=${value}`,
      'HttpOnly',
      'SameSite=strict',
      'Path=/',
      `Max-Age=${maxAge}`,
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    return cookieOptions.join('; ');
  }
}