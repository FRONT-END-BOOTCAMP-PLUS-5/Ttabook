import { UserRepository } from '../../../domain/repository/UserRepository';
import { User } from '../../../domain/entities/User';
import { SignupRequest } from '../application/dto/SignupRequest';
import { LoginRequest } from '../application/dto/LoginRequest';
import { PasswordUtil } from '../../../infrastructure/utils/PasswordUtil';

export class AuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async register(userData: SignupRequest): Promise<User> {
    // 이메일 중복 확인
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await PasswordUtil.hash(userData.password);

    // 사용자 생성
    const newUser = await this.userRepository.save({
      ...userData,
      password: hashedPassword,
    });

    return newUser;
  }

  async login(credentials: LoginRequest): Promise<User | null> {
    // 사용자 조회
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      return null;
    }

    // 비밀번호 검증
    const isPasswordValid = await PasswordUtil.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async verifyCredentials(credentials: LoginRequest): Promise<User | null> {
    return this.login(credentials);
  }
}