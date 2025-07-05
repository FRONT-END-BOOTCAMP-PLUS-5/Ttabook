import { NextRequest, NextResponse } from 'next/server';
import { CheckEmailDuplicationUseCase } from '../usecase/CheckEmailDuplicationUseCase';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SbUserRepository';
import { EmailCheckResponse, EmailCheckErrorResponse } from '../dto/EmailCheckResponse';
import { ValidationError } from '../dto/ValidationError';

// 의존성 생성 팩토리 - 테스트하기 쉽고 이해하기 명확함
function createCheckEmailDuplicationUseCase(): CheckEmailDuplicationUseCase {
  const userRepository = new SupabaseUserRepository();
  return new CheckEmailDuplicationUseCase(userRepository);
}

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

    const checkEmailDuplicationUseCase = createCheckEmailDuplicationUseCase();

    // 이메일 중복 확인
    const isDuplicate = await checkEmailDuplicationUseCase.execute(email);

    const response: EmailCheckResponse = {
      email: email,
      available: !isDuplicate,
      message: isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('이메일 중복 확인 중 오류 발생:', error);
    
    // 도메인별 에러 처리
    if (error instanceof ValidationError) {
      const errorResponse: EmailCheckErrorResponse = { error: error.message };
      return NextResponse.json(errorResponse, { status: 400 }); // Bad Request
    }
    
    // 알 수 없는 에러
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    const errorResponse: EmailCheckErrorResponse = { error: errorMessage };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}