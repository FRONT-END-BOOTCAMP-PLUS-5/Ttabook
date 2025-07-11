import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from './config';

// JWT 페이로드 인터페이스
export interface UserJWTPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// JWT 시크릿을 바이트 배열로 변환
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

/**
 * 사용자 정보로 15분 만료 액세스 토큰을 생성합니다
 */
export async function signAccessToken(user: { id: number; email: string; role: string }): Promise<string> {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);
  
  return await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (15 * 60)) // 15분
    .sign(secret);
}

/**
 * 사용자 정보로 14일 만료 리프레시 토큰을 생성합니다
 */
export async function signRefreshToken(user: { id: number; email: string; role: string }): Promise<string> {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);
  
  return await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (14 * 24 * 60 * 60)) // 14일
    .sign(secret);
}

/**
 * 액세스 토큰을 검증하고 사용자 정보를 반환합니다
 */
export async function verifyAccessToken(token: string): Promise<UserJWTPayload> {
  if (!token || token.trim() === '') {
    throw new Error('토큰이 제공되지 않았습니다');
  }

  const secret = getSecretKey();
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.id as number,
      email: payload.email as string,
      role: payload.role as string,
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    throw new Error(`토큰 검증 실패: ${errorMessage}`);
  }
}

/**
 * 리프레시 토큰을 검증하고 사용자 정보를 반환합니다
 */
export async function verifyRefreshToken(token: string): Promise<UserJWTPayload> {
  if (!token || token.trim() === '') {
    throw new Error('토큰이 제공되지 않았습니다');
  }

  const secret = getSecretKey();
  
  try {
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.id as number,
      email: payload.email as string,
      role: payload.role as string,
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    throw new Error(`토큰 검증 실패: ${errorMessage}`);
  }
}