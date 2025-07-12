import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

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

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 액세스 토큰 추출
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const accessToken = getCookieValue(cookieHeader, 'accessToken');
    if (!accessToken || accessToken.trim() === '') {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // JWT 토큰 검증
    let userPayload;
    try {
      userPayload = await verifyAccessToken(accessToken);
    } catch (error) {
      console.error('JWT verification error:', error);
      
      // 토큰 만료 에러 체크
      if (error instanceof Error && error.name === 'JWTExpired') {
        return NextResponse.json(
          { error: '토큰이 만료되었습니다' },
          { status: 401 }
        );
      }
      
      // 기타 JWT 검증 실패
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      );
    }

    // 사용자 정보 반환
    return NextResponse.json(
      {
        success: true,
        user: {
          id: userPayload.id,
          email: userPayload.email,
          role: userPayload.role,
          name: userPayload.name,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}