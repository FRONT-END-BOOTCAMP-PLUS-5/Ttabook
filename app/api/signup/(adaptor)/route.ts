import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/password';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

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
    // 요청 body 파싱
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '요청 데이터 형식이 올바르지 않습니다' },
        { status: 400 }
      );
    }

    // 입력 데이터 검증
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

    // 패스워드 해싱
    const hashedPassword = await hashPassword(password);

    // Supabase에 새 사용자 삽입
    const supabase = getSupabaseClient();
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: 'user',
      })
      .select('id, email, name, role, created_at')
      .single();

    // Supabase 에러 처리
    if (error) {
      console.error('Supabase error:', error);
      
      // 이메일 중복 에러 (unique constraint violation)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다' },
          { status: 409 }
        );
      }

      // 기타 에러
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    if (!newUser) {
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // JWT 토큰 생성
    const userPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = await signAccessToken(userPayload);
    const refreshToken = await signRefreshToken(userPayload);

    // 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // 쿠키 설정 (자동 로그인)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15분
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
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