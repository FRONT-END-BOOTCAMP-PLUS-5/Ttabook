import { UserRepository } from '../../../domain/repository/UserRepository';
import { User } from '../../../domain/entities/User';
import { SignupRequest } from '../dto/SignupRequest';
import { PasswordUtil } from '../../../infrastructure/utils/PasswordUtil';
import { DuplicateEmailError, ValidationError } from '../dto';
import { validateSignupRequest } from '../validation/AuthSchemas';
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