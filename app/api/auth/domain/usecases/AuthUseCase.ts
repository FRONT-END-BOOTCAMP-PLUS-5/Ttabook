import { UserRepository } from '../../../domain/repository/UserRepository';
import { User } from '../../../domain/entities/User';
import { SignupRequest } from '../../application/dto/SignupRequest';
import { LoginRequest } from '../../application/dto/LoginRequest';
import { PasswordUtil } from '../../../infrastructure/utils/PasswordUtil';
import { DuplicateEmailError, InvalidCredentialsError, ValidationError } from '../errors/AuthErrors';
import { validateSignupRequest, validateLoginRequest } from '../../application/validation/AuthSchemas';
import { ZodError } from 'zod';

export class AuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async register(userData: unknown): Promise<User> {
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

  async login(credentials: unknown): Promise<User> {
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

  async verifyCredentials(credentials: unknown): Promise<User | null> {
    try {
      return await this.login(credentials);
    } catch (error) {
      if (error instanceof InvalidCredentialsError || error instanceof ValidationError) {
        return null; // verifyCredentials는 null 반환 (예외 전파하지 않음)
      }
      throw error; // 다른 예외는 그대로 전파
    }
  }

  async checkEmailDuplication(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser !== null;
  }
}