import { IAuthService } from '../../domains/auth/interfaces/IAuthService';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, UserJWTPayload, UserForJWT } from '@/lib/jwt';
import { verifyPassword } from '@/lib/password';

export class AuthService implements IAuthService {
  async signAccessToken(user: UserForJWT): Promise<string> {
    return await signAccessToken(user);
  }

  async signRefreshToken(user: UserForJWT): Promise<string> {
    return await signRefreshToken(user);
  }

  async verifyAccessToken(token: string): Promise<UserJWTPayload> {
    return await verifyAccessToken(token);
  }

  async verifyRefreshToken(token: string): Promise<UserJWTPayload> {
    return await verifyRefreshToken(token);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await verifyPassword(plainPassword, hashedPassword);
  }
}