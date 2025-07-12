import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Clean Architecture imports
import { GetCurrentUserUsecase } from '@/backend/auth/me/usecases';
import { SupabaseUserRepository } from '@/backend/common/infrastructures/repositories/SbUserRepository';
import { AuthService, CookieService } from '@/backend/common/infrastructures/auth';

// Supabase 클라이언트 생성
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 설정이 필요합니다');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // 1. 쿠키에서 액세스 토큰 추출
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const cookieService = new CookieService();
    const accessToken = cookieService.extractTokenFromCookies(cookieHeader, 'accessToken');
    if (!accessToken || accessToken.trim() === '') {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 2. 의존성 주입 및 Use Case 실행
    const supabase = getSupabaseClient();
    const userRepository = new SupabaseUserRepository(supabase);
    const authService = new AuthService();
    const getCurrentUserUsecase = new GetCurrentUserUsecase(authService, userRepository);

    const result = await getCurrentUserUsecase.execute(accessToken);

    // 3. HTTP 응답 생성
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        user: result.user,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GetCurrentUser error:', error);
    
    // 비즈니스 로직 에러 (인증 실패 등)는 401로 처리
    if (error instanceof Error && 
        (error.message.includes('토큰') || 
         error.message.includes('인증') ||
         error.message.includes('사용자 정보를 찾을 수 없습니다'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // 기타 서버 에러
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}