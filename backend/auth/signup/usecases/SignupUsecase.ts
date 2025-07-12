import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { SignupRequestDto, SignupResponseDto } from '../dtos';

export class SignupUsecase {
  private userRepository: UserRepository;
  private authService: IAuthService;

  constructor(userRepository: UserRepository, authService: IAuthService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(signupData: SignupRequestDto): Promise<{ response: SignupResponseDto; tokens: { accessToken: string; refreshToken: string } }> {
    // 이메일 중복 체크
    const existingUser = await this.userRepository.findByEmail(signupData.email);
    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다');
    }

    // 패스워드 해싱
    const hashedPassword = await this.authService.hashPassword(signupData.password);

    // 새 사용자 생성
    const newUser = await this.userRepository.save({
      email: signupData.email,
      password: hashedPassword,
      name: signupData.name,
      type: 'user',
    });

    // JWT 토큰 생성
    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      type: newUser.type,
    };

    const accessToken = await this.authService.signAccessToken(tokenPayload);
    const refreshToken = await this.authService.signRefreshToken(tokenPayload);

    // 응답 생성
    const response = new SignupResponseDto(
      true,
      '회원가입이 완료되었습니다',
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        type: newUser.type,
      }
    );

    return {
      response,
      tokens: { accessToken, refreshToken },
    };
  }
}