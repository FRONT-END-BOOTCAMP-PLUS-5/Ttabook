'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { authApiService } from '@/app/services/api/auth';

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
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
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

  // 세션 초기화 함수 (HttpOnly 쿠키 사용)
  const initializeSession = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // HttpOnly 쿠키를 직접 읽을 수 없으므로, API 호출로 세션 확인
      try {
        const response = await authApiService.getCurrentUser();
        if (response.success && response.user) {
          setUser({
            id: response.user.id,
            email: response.user.email,
            type: response.user.type,
          });
          return;
        }
      } catch {
        // 세션이 없거나 만료된 경우, 로그아웃 상태로 설정
      }

      setUser(null);
    } catch (error) {
      console.error('세션 초기화 오류:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 세션 새로고침 함수 (HttpOnly 쿠키가 이미 서버에서 설정된 후 호출)
  const refreshSession = async () => {
    try {
      // 서버에서 사용자 정보 가져오기 (HttpOnly 쿠키 사용)
      const response = await authApiService.getCurrentUser();
      if (response.success && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          type: response.user.type,
        });
      } else {
        throw new Error(response.message || '사용자 정보를 가져올 수 없습니다');
      }
    } catch (error) {
      console.error('세션 새로고침 오류:', error);
      setUser(null);
      throw error;
    }
  };

  // 로그아웃 함수 (서버에서 HttpOnly 쿠키 삭제)
  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('로그아웃 API 호출 오류:', error);
    } finally {
      // API 호출 성공/실패 여부와 관계없이 클라이언트 상태 초기화
      setUser(null);
    }
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
    refreshSession,
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
