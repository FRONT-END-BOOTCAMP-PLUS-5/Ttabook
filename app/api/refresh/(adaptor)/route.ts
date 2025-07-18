import { NextRequest, NextResponse } from 'next/server';

// Clean Architecture imports
import { RefreshTokenUsecase } from '@/backend/auth/refresh/usecases';
import { RefreshTokenRequestDto } from '@/backend/auth/refresh/dtos';
import {
  AuthService,
  CookieService,
} from '@/backend/common/infrastructures/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. 쿠키에서 리프레시 토큰 추출
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '리프레시 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    const cookieService = new CookieService();
    const refreshToken = cookieService.extractTokenFromCookies(
      cookieHeader,
      'refreshToken'
    );
    if (!refreshToken || refreshToken.trim() === '') {
      return NextResponse.json(
        { error: '리프레시 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    // 2. 의존성 주입 및 Use Case 실행
    const authService = new AuthService();
    const refreshTokenUsecase = new RefreshTokenUsecase(authService);

    const refreshRequest = new RefreshTokenRequestDto(refreshToken);
    const result = await refreshTokenUsecase.execute(refreshRequest);

    // 3. HTTP 응답 생성
    const response = NextResponse.json(
      {
        success: result.response.success,
        message: result.response.message,
      },
      { status: 200 }
    );

    // 4. 쿠키 설정
    const cookies = cookieService.setAuthCookies(
      result.tokens.accessToken,
      result.tokens.refreshToken
    );
    response.headers.set(
      'Set-Cookie',
      [cookies.accessToken, cookies.refreshToken].join(', ')
    );

    return response;
  } catch (error) {
    console.error('RefreshToken error:', error);

    // 비즈니스 로직 에러 (토큰 만료/검증 실패 등)는 401로 처리
    if (
      error instanceof Error &&
      (error.message.includes('토큰') ||
        error.message.includes('만료') ||
        error.message.includes('유효하지 않은'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // 기타 서버 에러
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
