import { UserRepository } from '@/backend/common/domain/repository/UserRepository';
import { User } from '@/backend/common/domain/entities/User';
import { InvalidCredentialsError, ValidationError } from '../dtos';
import { LoginUseCase } from './LoginUseCase';

export class VerifyCredentialsUseCase {
  private loginUseCase: LoginUseCase;

  constructor(private userRepository: UserRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
  }

  async execute(credentials: unknown): Promise<User | null> {
    try {
      return await this.loginUseCase.execute(credentials);
    } catch (error) {
      if (error instanceof InvalidCredentialsError || error instanceof ValidationError) {
        return null; // verifyCredentials는 null 반환 (예외 전파하지 않음)
      }
      throw error; // 다른 예외는 그대로 전파
    }
  }
}