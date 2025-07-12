import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from './config';

// JWT 페이로드 인터페이스 (JWT 내부에서는 number ID 사용)
export interface UserJWTPayload {
  id: number;
  originalId: string; // 원본 UUID 저장
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// 사용자 입력 인터페이스 (Entity는 string ID와 type 필드 사용)
export interface UserForJWT {
  id: string; // UUID from database
  email: string;
  type: string; // type field from database
}

// JWT 시크릿을 바이트 배열로 변환
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

// UUID를 숫자로 변환하는 함수 (해시 기반)
function uuidToNumber(uuid: string): number {
  // UUID를 간단한 해시로 변환 (32비트 정수)
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash);
}

/**
 * 사용자 정보로 15분 만료 액세스 토큰을 생성합니다
 */
export async function signAccessToken(user: UserForJWT): Promise<string> {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);
  
  return await new SignJWT({
    id: uuidToNumber(user.id), // UUID를 number로 변환
    originalId: user.id, // 원본 UUID 저장
    email: user.email,
    role: user.type, // type을 role로 매핑
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (15 * 60)) // 15분
    .sign(secret);
}

/**
 * 사용자 정보로 14일 만료 리프레시 토큰을 생성합니다
 */
export async function signRefreshToken(user: UserForJWT): Promise<string> {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);
  
  return await new SignJWT({
    id: uuidToNumber(user.id), // UUID를 number로 변환
    originalId: user.id, // 원본 UUID 저장
    email: user.email,
    role: user.type, // type을 role로 매핑
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
      originalId: payload.originalId as string,
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
      originalId: payload.originalId as string,
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