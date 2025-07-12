/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// JWT 유틸리티 모킹
const mockSignAccessToken = jest.fn();
const mockSignRefreshToken = jest.fn();
const mockVerifyAccessToken = jest.fn();
const mockVerifyRefreshToken = jest.fn();

jest.unstable_mockModule('../../lib/jwt', () => ({
  signAccessToken: mockSignAccessToken,
  signRefreshToken: mockSignRefreshToken,
  verifyAccessToken: mockVerifyAccessToken,
  verifyRefreshToken: mockVerifyRefreshToken,
  UserJWTPayload: {},
  UserForJWT: {},
}));

// 쿠키 모킹
const mockGetCookie = jest.fn();
const mockSetCookie = jest.fn();
const mockDeleteCookie = jest.fn();

jest.unstable_mockModule('js-cookie', () => ({
  default: {
    get: mockGetCookie,
    set: mockSetCookie,
    remove: mockDeleteCookie,
  },
  get: mockGetCookie,
  set: mockSetCookie,
  remove: mockDeleteCookie,
}));

// 테스트 컴포넌트
function TestComponent() {
  return <div data-testid="test-component">테스트 컴포넌트</div>;
}

describe('SessionProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // 모든 mock 초기화
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('세션 초기화', () => {
    it('유효한 accessToken이 있으면 사용자 세션을 설정해야 한다', async () => {
      const mockUser = {
        id: 123, // number ID
        originalId: 'user_123', // original UUID string
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      mockGetCookie.mockImplementation((name: string) => {
        if (name === 'accessToken') return 'valid_access_token';
        if (name === 'refreshToken') return 'valid_refresh_token';
        return undefined;
      });

      mockVerifyAccessToken.mockResolvedValue(mockUser);

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();
        
        if (isLoading) return <div data-testid="loading">로딩 중...</div>;
        
        return (
          <div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
            <div data-testid="user-role">{user?.role || 'no-role'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      // 로딩 상태 확인
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // 세션 로드 완료 대기
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid_access_token');
    });

    it('accessToken이 만료되었으면 refreshToken으로 갱신해야 한다', async () => {
      const expiredError = new Error('Token expired');
      const mockUser = {
        id: 123, // number ID
        originalId: 'user_123', // original UUID string
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      mockGetCookie.mockImplementation((name: string) => {
        if (name === 'accessToken') return 'expired_access_token';
        if (name === 'refreshToken') return 'valid_refresh_token';
        return undefined;
      });

      mockVerifyAccessToken.mockRejectedValue(expiredError);
      mockVerifyRefreshToken.mockResolvedValue(mockUser);
      mockSignAccessToken.mockResolvedValue('new_access_token');

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();
        
        if (isLoading) return <div data-testid="loading">로딩 중...</div>;
        
        return (
          <div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(mockVerifyAccessToken).toHaveBeenCalledWith('expired_access_token');
      expect(mockVerifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
      expect(mockSignAccessToken).toHaveBeenCalledWith({
        id: mockUser.originalId, // Use original UUID string
        email: mockUser.email,
        type: mockUser.role, // Map role to type
      });
      expect(mockSetCookie).toHaveBeenCalledWith('accessToken', 'new_access_token', expect.objectContaining({
        secure: false, // NODE_ENV이 production이 아니므로 false
        sameSite: 'strict',
      }));
    });

    it('토큰이 모두 유효하지 않으면 로그아웃 상태여야 한다', async () => {
      mockGetCookie.mockImplementation((name: string) => {
        if (name === 'accessToken') return 'invalid_access_token';
        if (name === 'refreshToken') return 'invalid_refresh_token';
        return undefined;
      });

      mockVerifyAccessToken.mockRejectedValue(new Error('Invalid token'));
      mockVerifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();
        
        if (isLoading) return <div data-testid="loading">로딩 중...</div>;
        
        return (
          <div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(mockDeleteCookie).toHaveBeenCalledWith('accessToken');
      expect(mockDeleteCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('토큰이 없으면 로그아웃 상태여야 한다', async () => {
      mockGetCookie.mockReturnValue(undefined);

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();
        
        if (isLoading) return <div data-testid="loading">로딩 중...</div>;
        
        return (
          <div>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(mockVerifyAccessToken).not.toHaveBeenCalled();
      expect(mockVerifyRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('세션 관리 메서드', () => {
    it('login 메서드는 토큰을 쿠키에 저장하고 사용자 정보를 설정해야 한다', async () => {
      const mockUser = {
        id: 123, // number ID
        originalId: 'user_123', // original UUID string
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      mockGetCookie.mockReturnValue(undefined);
      mockVerifyAccessToken.mockResolvedValue(mockUser);

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { login, isAuthenticated, user } = useSession();
        
        return (
          <div>
            <button
              data-testid="login-button"
              onClick={() => login('new_access_token', 'new_refresh_token')}
            >
              로그인
            </button>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      // 초기 상태는 로그아웃
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      // 로그인 실행
      act(() => {
        screen.getByTestId('login-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(mockSetCookie).toHaveBeenCalledWith('accessToken', 'new_access_token', expect.objectContaining({
        secure: false, // NODE_ENV이 production이 아니므로 false
        sameSite: 'strict',
      }));
      expect(mockSetCookie).toHaveBeenCalledWith('refreshToken', 'new_refresh_token', expect.objectContaining({
        secure: false, // NODE_ENV이 production이 아니므로 false
        sameSite: 'strict',
      }));
    });

    it('logout 메서드는 쿠키를 삭제하고 사용자 정보를 초기화해야 한다', async () => {
      const mockUser = {
        id: 123, // number ID
        originalId: 'user_123', // original UUID string
        email: 'test@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      mockGetCookie.mockImplementation((name: string) => {
        if (name === 'accessToken') return 'valid_access_token';
        if (name === 'refreshToken') return 'valid_refresh_token';
        return undefined;
      });

      mockVerifyAccessToken.mockResolvedValue(mockUser);

      const { SessionProvider, useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        const { logout, isAuthenticated, user } = useSession();
        
        return (
          <div>
            <button data-testid="logout-button" onClick={logout}>
              로그아웃
            </button>
            <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
          </div>
        );
      }

      render(
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <TestConsumer />
          </SessionProvider>
        </QueryClientProvider>
      );

      // 로그인 상태 확인
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // 로그아웃 실행
      act(() => {
        screen.getByTestId('logout-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
      expect(mockDeleteCookie).toHaveBeenCalledWith('accessToken');
      expect(mockDeleteCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('컨텍스트 에러 처리', () => {
    it('SessionProvider 외부에서 useSession을 사용하면 에러를 던져야 한다', async () => {
      const { useSession } = await import('../../app/providers/SessionProvider.tsx');

      function TestConsumer() {
        useSession();
        return <div>테스트</div>;
      }

      // 에러 경계 설정
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSession은 SessionProvider 내부에서만 사용할 수 있습니다');

      console.error = originalError;
    });
  });
});