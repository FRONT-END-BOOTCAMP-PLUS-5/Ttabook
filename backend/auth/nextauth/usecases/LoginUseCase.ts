import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { User } from '@/backend/common/domains/entities/User';
import { LoginRequest } from '../dtos/LoginRequest';
import { PasswordUtil } from '@/backend/common/infrastructures/utils/PasswordUtil';
import { InvalidCredentialsError } from '../dtos/InvalidCredentialsError';
import { ValidationError } from '../dtos/ValidationError';
import { validateLoginRequest } from './LoginValidation';
import { ZodError } from 'zod';

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(credentials: unknown): Promise<User> {
    // Zod 검증
    let validatedCredentials: LoginRequest;
    try {
      validatedCredentials = validateLoginRequest(credentials);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }

    // 사용자 조회
    const user = await this.userRepository.findByEmail(validatedCredentials.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 비밀번호 검증
    const isPasswordValid = await PasswordUtil.compare(
      validatedCredentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}