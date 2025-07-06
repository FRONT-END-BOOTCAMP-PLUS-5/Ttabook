import { UserRepository } from '../../../../domain/repository';
import { User } from '../../../../domain/entities';
import { LoginRequest } from '../dto/LoginRequest';
import { PasswordUtil } from '../../../../infrastructure/utils';
import { InvalidCredentialsError } from '../dto/InvalidCredentialsError';
import { ValidationError } from '../dto/ValidationError';
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