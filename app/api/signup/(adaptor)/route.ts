import { NextRequest, NextResponse } from 'next/server';
import { AuthUseCase } from '../../auth/domain/usecases/AuthUseCase'; 
import { SupabaseUserRepository } from '../../infrastructure/repositories/SbUserRepository'; 
import { SignupRequest } from '../../auth/application/dto/SignupRequest'; 

const userRepository = new SupabaseUserRepository();
const authUseCase = new AuthUseCase(userRepository);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, type = 'user' } = body as SignupRequest;

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const user = await authUseCase.register({
      email,
      password,
      type,
    });

    // 비밀번호 제외하고 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: '사용자 등록이 완료되었습니다.', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('사용자 등록 중 오류 발생:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}