/**
 * @jest-environment jsdom
 */
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Fetch API 모킹
const mockFetch = jest.fn();

// API 서비스 모킹
const mockGetCurrentUser = jest.fn();

jest.unstable_mockModule('../../app/services/api/auth', () => ({
  authApiService: {
    getCurrentUser: mockGetCurrentUser,
  },
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
    
    // fetch 글로벌 모킹
    global.fetch = mockFetch;
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('세션 초기화', () => {
    it('HttpOnly 쿠키가 유효하면 사용자 세션을 설정해야 한다', async () => {
      const mockApiResponse = {
        success: true,
        message: '사용자 정보 조회가 완료되었습니다',
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          type: 'user',
        },
      };

      mockGetCurrentUser.mockResolvedValue(mockApiResponse);

      const { SessionProvider, useSession } = await import(
        '../../app/providers/SessionProvider.tsx'
      );

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();

        if (isLoading) return <div data-testid="loading">로딩 중...</div>;

        return (
          <div>
            <div data-testid="authenticated">
              {isAuthenticated ? 'true' : 'false'}
            </div>
            <div data-testid="user-email">{user?.email || 'no-email'}</div>
            <div data-testid="user-type">{user?.type || 'no-type'}</div>
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

      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('user-type')).toHaveTextContent('user');
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    it('HttpOnly 쿠키가 없거나 만료되면 로그아웃 상태여야 한다', async () => {
      const expiredError = new Error('HTTP error! status: 401');

      mockGetCurrentUser.mockRejectedValue(expiredError);

      const { SessionProvider, useSession } = await import(
        '../../app/providers/SessionProvider.tsx'
      );

      function TestConsumer() {
        const { user, isLoading, isAuthenticated } = useSession();

        if (isLoading) return <div data-testid="loading">로딩 중...</div>;

        return (
          <div>
            <div data-testid="authenticated">
              {isAuthenticated ? 'true' : 'false'}
            </div>
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
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

  });

  describe('세션 관리 메서드', () => {
    it('refreshSession 메서드는 HttpOnly 쿠키로부터 사용자 정보를 설정해야 한다', async () => {
      const mockApiResponse = {
        success: true,
        message: '사용자 정보 조회가 완료되었습니다',
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          type: 'user',
        },
      };

      // 초기에는 세션 없음, refreshSession 호출 후에는 세션 있음
      mockGetCurrentUser
        .mockRejectedValueOnce(new Error('No session'))
        .mockResolvedValueOnce(mockApiResponse);

      const { SessionProvider, useSession } = await import(
        '../../app/providers/SessionProvider.tsx'
      );

      function TestConsumer() {
        const { refreshSession, isAuthenticated, user } = useSession();

        return (
          <div>
            <button
              data-testid="refresh-button"
              onClick={() => refreshSession()}
            >
              세션 새로고침
            </button>
            <div data-testid="authenticated">
              {isAuthenticated ? 'true' : 'false'}
            </div>
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

      // 세션 새로고침 실행
      act(() => {
        screen.getByTestId('refresh-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(2); // 초기화 + 세션 새로고침
    });

    it('logout 메서드는 /api/logout를 호출하고 사용자 정보를 초기화해야 한다', async () => {
      const mockApiResponse = {
        success: true,
        message: '사용자 정보 조회가 완료되었습니다',
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
          type: 'user',
        },
      };

      // 초기에는 세션 있음
      mockGetCurrentUser.mockResolvedValue(mockApiResponse);
      
      // /api/logout 호출 모킹
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: '로그아웃 완료' }),
      });

      const { SessionProvider, useSession } = await import(
        '../../app/providers/SessionProvider.tsx'
      );

      function TestConsumer() {
        const { logout, isAuthenticated, user } = useSession();

        return (
          <div>
            <button data-testid="logout-button" onClick={logout}>
              로그아웃
            </button>
            <div data-testid="authenticated">
              {isAuthenticated ? 'true' : 'false'}
            </div>
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
      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });
  });

  describe('컨텍스트 에러 처리', () => {
    it('SessionProvider 외부에서 useSession을 사용하면 에러를 던져야 한다', async () => {
      const { useSession } = await import(
        '../../app/providers/SessionProvider.tsx'
      );

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
