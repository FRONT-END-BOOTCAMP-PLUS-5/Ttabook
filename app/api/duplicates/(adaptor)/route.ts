import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/backend/common/infrastructures/supabase/server';

// 이메일 검증 스키마
const emailSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
});


export async function GET(request: NextRequest) {
  try {
    // URL에서 이메일 파라미터 추출
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // 이메일이 제공되지 않았거나 빈 값인 경우
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: '이메일이 제공되지 않았습니다' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const validationResult = emailSchema.safeParse({ email: email.trim() });
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || '유효한 이메일 주소를 입력해주세요';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const validatedEmail = validationResult.data.email;

    // Supabase에서 이메일 중복 체크
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedEmail)
      .single();

    // Supabase 에러 처리 (사용자 없음 제외)
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 사용자가 존재하는 경우 (data가 있음)
    if (data) {
      return NextResponse.json(
        {
          available: false,
          message: '이미 사용 중인 이메일입니다',
        },
        { status: 409 }
      );
    }

    // 사용자가 존재하지 않는 경우 (사용 가능)
    return NextResponse.json(
      {
        available: true,
        message: '사용 가능한 이메일입니다',
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