import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Clean Architecture imports
import { SignupUsecase } from '@/backend/auth/signup/usecases';
import { SignupRequestDto } from '@/backend/auth/signup/dtos';
import { SupabaseUserRepository } from '@/backend/common/infrastructures/repositories/SbUserRepository';
import { AuthService, CookieService } from '@/backend/common/infrastructures/auth';

// 회원가입 요청 데이터 검증 스키마
const signupSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '패스워드는 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').trim(),
});

// Supabase 클라이언트 생성
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 설정이 필요합니다');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

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
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      let errorMessage = '입력 데이터가 올바르지 않습니다';
      
      if (firstIssue) {
        const field = firstIssue.path[0];
        if (field === 'email') {
          errorMessage = firstIssue.code === 'invalid_type' ? '이메일을 입력해주세요' : firstIssue.message;
        } else if (field === 'password') {
          errorMessage = firstIssue.code === 'invalid_type' ? '패스워드를 입력해주세요' : firstIssue.message;
        } else if (field === 'name') {
          errorMessage = firstIssue.code === 'invalid_type' ? '이름을 입력해주세요' : firstIssue.message;
        } else {
          errorMessage = firstIssue.message;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // 3. 의존성 주입 및 Use Case 실행
    const supabase = getSupabaseClient();
    const userRepository = new SupabaseUserRepository(supabase);
    const authService = new AuthService();
    const cookieService = new CookieService();
    const signupUsecase = new SignupUsecase(userRepository, authService);

    const signupRequest = new SignupRequestDto(email, password, name);
    const result = await signupUsecase.execute(signupRequest);

    // 4. HTTP 응답 생성
    const response = NextResponse.json(
      {
        success: result.response.success,
        message: result.response.message,
        user: result.response.user,
      },
      { status: 201 }
    );

    // 5. 쿠키 설정
    const cookies = cookieService.setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);
    response.headers.set('Set-Cookie', [cookies.accessToken, cookies.refreshToken].join(', '));

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    
    // 비즈니스 로직 에러 (이메일 중복 등)는 409로 처리
    if (error instanceof Error && error.message.includes('이미 사용 중인 이메일입니다')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    // 기타 서버 에러
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}