'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/app/providers/SessionProvider';

// ProtectedRoute Props 인터페이스
interface ProtectedRouteProps {
  children: ReactNode;
  type?: string | string[];
  loadingComponent?: ReactNode;
}

/**
 * 인증된 사용자만 접근할 수 있는 라우트를 보호하는 컴포넌트
 * 선택적으로 특정 역할을 가진 사용자만 접근하도록 제한할 수 있습니다
 */
export function ProtectedRoute({
  children,
  type,
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (isLoading) {
      return;
    }

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      const redirectUrl = `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // 사용자 타입 검사가 필요한 경우
    if (type && user) {
      const hasRequiredType = Array.isArray(type)
        ? type.includes(user.type)
        : user.type === type;

      if (!hasRequiredType) {
        router.replace('/forbidden');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, type, router, pathname]);

  // 로딩 중일 때
  if (isLoading) {
    return loadingComponent || <div data-testid="loading">로딩 중...</div>;
  }

  // 인증되지 않은 사용자는 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  // 사용자 타입 검사
  if (type && user) {
    const hasRequiredType = Array.isArray(type)
      ? type.includes(user.type)
      : user.type === type;

    if (!hasRequiredType) {
      return null; // 접근 거부 페이지로 리다이렉트 중
    }
  }

  // 모든 검증을 통과한 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}
