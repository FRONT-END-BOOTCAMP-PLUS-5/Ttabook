'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  UserJWTPayload,
} from '@/lib/jwt';

// 세션 사용자 타입 (JWT 페이로드에서 파생)
export interface SessionUser {
  id: string;
  email: string;
  type: string;
}

// 세션 컨텍스트 타입
interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

// 세션 컨텍스트 생성
const SessionContext = createContext<SessionContextType | null>(null);

// SessionProvider 컴포넌트
interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 쿠키 설정 옵션
  const getCookieOptions = () => ({
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  });

  // JWT 페이로드를 SessionUser로 변환
  const jwtPayloadToUser = (payload: UserJWTPayload): SessionUser => ({
    id: payload.id, // Use UUID string directly
    email: payload.email,
    type: payload.type,
  });

  // 세션 초기화 함수
  const initializeSession = React.useCallback(async () => {
    try {
      setIsLoading(true);

      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      // 토큰이 없으면 로그아웃 상태
      if (!accessToken && !refreshToken) {
        setUser(null);
        return;
      }

      // accessToken 검증 시도
      if (accessToken) {
        try {
          const payload = await verifyAccessToken(accessToken);
          setUser(jwtPayloadToUser(payload));
          return;
        } catch {
          // accessToken이 유효하지 않으면 refreshToken으로 갱신 시도
        }
      }

      // refreshToken으로 새로운 accessToken 생성
      if (refreshToken) {
        try {
          const payload = await verifyRefreshToken(refreshToken);
          const newAccessToken = await signAccessToken({
            id: payload.id, // Use UUID string directly
            email: payload.email,
            type: payload.type,
          });

          // 새 accessToken을 쿠키에 저장
          Cookies.set('accessToken', newAccessToken, {
            ...getCookieOptions(),
            maxAge: 15 * 60, // 15분
          });

          setUser(jwtPayloadToUser(payload));
          return;
        } catch {
          // refreshToken도 유효하지 않으면 로그아웃
        }
      }

      // 모든 토큰이 유효하지 않으면 정리하고 로그아웃
      clearTokens();
      setUser(null);
    } catch (error) {
      console.error('세션 초기화 오류:', error);
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 토큰 정리 함수
  const clearTokens = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  };

  // 로그인 함수
  const login = async (accessToken: string, refreshToken: string) => {
    try {
      // 쿠키에 토큰 저장
      Cookies.set('accessToken', accessToken, {
        ...getCookieOptions(),
        maxAge: 15 * 60, // 15분
      });

      Cookies.set('refreshToken', refreshToken, {
        ...getCookieOptions(),
        maxAge: 14 * 24 * 60 * 60, // 14일
      });

      // accessToken 검증 및 사용자 정보 설정
      const payload = await verifyAccessToken(accessToken);
      setUser(jwtPayloadToUser(payload));
    } catch (error) {
      console.error('로그인 오류:', error);
      clearTokens();
      setUser(null);
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    clearTokens();
    setUser(null);
  };

  // 컴포넌트 마운트 시 세션 초기화
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // 컨텍스트 값
  const contextValue: SessionContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// useSession 훅
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error(
      'useSession은 SessionProvider 내부에서만 사용할 수 있습니다'
    );
  }

  return context;
}
