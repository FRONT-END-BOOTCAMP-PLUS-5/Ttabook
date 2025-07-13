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
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Next.js router 모킹
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.unstable_mockModule('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  usePathname: () => '/protected-page',
}));

// SessionProvider 모킹
const mockUseSession = jest.fn();

jest.unstable_mockModule('../../app/providers/SessionProvider.tsx', () => ({
  useSession: mockUseSession,
}));

// 테스트 컴포넌트
function TestProtectedContent() {
  return <div data-testid="protected-content">보호된 콘텐츠</div>;
}

describe('ProtectedRoute', () => {
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

  describe('인증되지 않은 사용자', () => {
    it('로그인 페이지로 리다이렉트해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(mockReplace).toHaveBeenCalledWith('/login?next=%2Fprotected-page');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('next 파라미터와 함께 로그인 페이지로 리다이렉트해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(mockReplace).toHaveBeenCalledWith('/login?next=%2Fprotected-page');
    });
  });

  describe('인증된 사용자', () => {
    it('역할 제한이 없으면 콘텐츠를 렌더링해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: { id: 'user_123', email: 'test@example.com', role: 'user' },
        isLoading: false,
        isAuthenticated: true,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('필요한 역할을 가지고 있으면 콘텐츠를 렌더링해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: { id: 'admin_123', email: 'admin@example.com', role: 'admin' },
        isLoading: false,
        isAuthenticated: true,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute role="admin">
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('필요한 역할이 여러 개 중 하나를 가지고 있으면 콘텐츠를 렌더링해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: { id: 'user_123', email: 'user@example.com', role: 'user' },
        isLoading: false,
        isAuthenticated: true,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute role={['admin', 'user']}>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('역할 제한', () => {
    it('필요한 역할을 가지지 않으면 접근 거부 페이지로 리다이렉트해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: { id: 'user_123', email: 'user@example.com', role: 'user' },
        isLoading: false,
        isAuthenticated: true,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute role="admin">
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(mockReplace).toHaveBeenCalledWith('/forbidden');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('필요한 역할 배열 중 어느 것도 가지지 않으면 접근 거부해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: { id: 'user_123', email: 'user@example.com', role: 'user' },
        isLoading: false,
        isAuthenticated: true,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute role={['admin', 'moderator']}>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(mockReplace).toHaveBeenCalledWith('/forbidden');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때는 로딩 표시를 해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('커스텀 로딩 컴포넌트', () => {
    it('커스텀 로딩 컴포넌트를 렌더링해야 한다', async () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      const CustomLoadingComponent = () => (
        <div data-testid="custom-loading">커스텀 로딩...</div>
      );

      const { ProtectedRoute } = await import(
        '../../app/components/ProtectedRoute.tsx'
      );

      render(
        <QueryClientProvider client={queryClient}>
          <ProtectedRoute loadingComponent={<CustomLoadingComponent />}>
            <TestProtectedContent />
          </ProtectedRoute>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
