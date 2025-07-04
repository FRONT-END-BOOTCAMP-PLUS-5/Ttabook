import { NextRequest, NextResponse } from 'next/server';
import { AuthUseCase } from '../../domain/usecases/AuthUseCase';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SbUserRepository';
import { EmailCheckResponse, EmailCheckErrorResponse } from '../../application/dto/EmailCheckResponse';
import { z } from 'zod';

const emailSchema = z.string().email('유효하지 않은 이메일 형식입니다.');

export async function GET(request: NextRequest): Promise<NextResponse<EmailCheckResponse | EmailCheckErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '이메일 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 형식입니다.' },
        { status: 400 }
      );
    }

    // 인라인 팩토리 패턴으로 의존성 주입
    const userRepository = new SupabaseUserRepository();
    const authUseCase = new AuthUseCase(userRepository);

    // 이메일 중복 확인
    const isDuplicate = await authUseCase.checkEmailDuplication(email);

    const response: EmailCheckResponse = {
      email: email,
      available: !isDuplicate,
      message: isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}