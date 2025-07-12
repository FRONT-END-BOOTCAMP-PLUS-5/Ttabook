import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';

// 쿠키에서 특정 값을 추출하는 헬퍼 함수
function getCookieValue(cookies: string, name: string): string | null {
  const cookiePairs = cookies.split(';');
  
  for (const pair of cookiePairs) {
    const [cookieName, cookieValue] = pair.trim().split('=');
    if (cookieName === name) {
      return cookieValue || null;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 리프레시 토큰 추출
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '리프레시 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    const refreshToken = getCookieValue(cookieHeader, 'refreshToken');
    if (!refreshToken || refreshToken.trim() === '') {
      return NextResponse.json(
        { error: '리프레시 토큰이 필요합니다' },
        { status: 401 }
      );
    }

    // 리프레시 토큰 검증
    let userPayload;
    try {
      userPayload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      console.error('JWT refresh token verification error:', error);
      
      // 토큰 만료 에러 체크
      if (error instanceof Error && error.name === 'JWTExpired') {
        return NextResponse.json(
          { error: '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요' },
          { status: 401 }
        );
      }
      
      // 기타 JWT 검증 실패
      return NextResponse.json(
        { error: '유효하지 않은 리프레시 토큰입니다' },
        { status: 401 }
      );
    }

    // 새로운 토큰 생성
    const tokenPayload = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
    };

    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload);

    // 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: '토큰이 갱신되었습니다',
      },
      { status: 200 }
    );

    // 새로운 쿠키 설정
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15분
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60, // 14일
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}