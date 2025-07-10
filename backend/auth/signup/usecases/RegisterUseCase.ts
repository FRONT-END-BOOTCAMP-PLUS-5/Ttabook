import { UserRepository } from '@/backend/common/domain/repository/UserRepository'; 
import { User } from '@/backend/common/domain/entities/User'; 
import { SignupRequest } from '../dtos/SignupRequest';
import { PasswordUtil } from '@/backend/common/infrastructure/utils/PasswordUtil';
import { DuplicateEmailError } from '../dtos/DuplicateEmailError';
import { ValidationError } from '../dtos/ValidationError';
import { validateSignupRequest } from './SignupValidation';
import { ZodError } from 'zod';

export class RegisterUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: unknown): Promise<User> {
    // Zod 검증
    let validatedData: SignupRequest;
    try {
      validatedData = validateSignupRequest(userData);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new DuplicateEmailError(validatedData.email);
    }

    // 비밀번호 해싱
    const hashedPassword = await PasswordUtil.hash(validatedData.password);

    // 사용자 생성
    const newUser = await this.userRepository.save({
      ...validatedData,
      password: hashedPassword,
    });

    return newUser;
  }
}