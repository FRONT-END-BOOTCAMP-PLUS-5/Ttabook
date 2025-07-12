import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/backend/common/infrastructures/supabase/server';

// Clean Architecture imports
import { SigninUsecase } from '@/backend/auth/signin/usecases';
import { SigninRequestDto } from '@/backend/auth/signin/dtos';
import { SupabaseUserRepository } from '@/backend/common/infrastructures/repositories/SbUserRepository';
import { AuthService, CookieService } from '@/backend/common/infrastructures/auth';

// 로그인 요청 데이터 검증 스키마
const signinSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '패스워드를 입력해주세요'),
});


export async function POST(request: NextRequest) {
  try {
    // 1. 요청 body 파싱
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 데이터 형식이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    // 2. 입력 데이터 검증
    const validationResult = signinSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      let errorMessage = '입력 데이터가 올바르지 않습니다';
      
      if (firstIssue) {
        const field = firstIssue.path[0];
        if (field === 'email') {
          errorMessage = firstIssue.code === 'invalid_type' ? '이메일을 입력해주세요' : firstIssue.message;
        } else if (field === 'password') {
          errorMessage = firstIssue.code === 'invalid_type' ? '패스워드를 입력해주세요' : firstIssue.message;
        } else {
          errorMessage = firstIssue.message;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // 3. 의존성 주입 및 Use Case 실행
    const supabase = await createClient();
    const userRepository = new SupabaseUserRepository(supabase);
    const authService = new AuthService();
    const cookieService = new CookieService();
    const signinUsecase = new SigninUsecase(userRepository, authService);

    const signinRequest = new SigninRequestDto(email, password);
    const result = await signinUsecase.execute(signinRequest);

    // 4. HTTP 응답 생성
    const response = NextResponse.json(
      {
        success: result.response.success,
        message: result.response.message,
        user: result.response.user,
      },
      { status: 200 }
    );

    // 5. 쿠키 설정
    const cookies = cookieService.setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);
    response.headers.set('Set-Cookie', [cookies.accessToken, cookies.refreshToken].join(', '));

    return response;

  } catch (error) {
    console.error('Signin error:', error);
    
    // 비즈니스 로직 에러 (인증 실패 등)는 401로 처리
    if (error instanceof Error && 
        (error.message.includes('이메일 또는 패스워드가 올바르지 않습니다') ||
         error.message.includes('인증'))) {
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