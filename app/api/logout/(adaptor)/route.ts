import { NextResponse } from 'next/server';

// Logout is simple enough to not need clean architecture - just clear cookies
export async function POST() {
  try {
    // 로그아웃 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: '로그아웃이 완료되었습니다',
      },
      { status: 200 }
    );

    // 인증 관련 쿠키 삭제
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}