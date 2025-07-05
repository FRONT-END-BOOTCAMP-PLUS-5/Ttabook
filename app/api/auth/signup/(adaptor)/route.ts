import { NextRequest, NextResponse } from 'next/server';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase'; 
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SbUserRepository';
import { SignupResponse, SignupErrorResponse } from '../../application/dto/SignupResponse';
import { DuplicateEmailError, ValidationError, AuthError } from '../../application/dto'; 

// 의존성 생성 팩토리 - 테스트하기 쉽고 이해하기 명확함
function createRegisterUseCase(): RegisterUseCase {
  const userRepository = new SupabaseUserRepository();
  return new RegisterUseCase(userRepository);
}

export async function POST(request: NextRequest) {
  try {
    const registerUseCase = createRegisterUseCase();
    
    const body = await request.json();
    
    // Zod 검증은 RegisterUseCase에서 처리됨
    const user = await registerUseCase.execute(body);

    // 응답 DTO로 변환 - 보안상 password 제외
    const response: SignupResponse = {
      message: '사용자 등록이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        type: user.type,
        name: user.name,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('사용자 등록 중 오류 발생:', error);
    
    // 도메인별 에러 처리
    if (error instanceof DuplicateEmailError) {
      const errorResponse: SignupErrorResponse = { error: error.message };
      return NextResponse.json(errorResponse, { status: 409 }); // Conflict
    }
    
    if (error instanceof ValidationError) {
      const errorResponse: SignupErrorResponse = { error: error.message };
      return NextResponse.json(errorResponse, { status: 400 }); // Bad Request
    }
    
    if (error instanceof AuthError) {
      const errorResponse: SignupErrorResponse = { error: error.message };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // 알 수 없는 에러
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    const errorResponse: SignupErrorResponse = { error: errorMessage };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}