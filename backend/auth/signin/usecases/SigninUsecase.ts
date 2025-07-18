import { UserRepository } from '@/backend/common/domains/repositories/UserRepository';
import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { SigninRequestDto, SigninResponseDto } from '../dtos';

export class SigninUsecase {
  private userRepository: UserRepository;
  private authService: IAuthService;

  constructor(userRepository: UserRepository, authService: IAuthService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(signinData: SigninRequestDto): Promise<{
    response: SigninResponseDto;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    // 사용자 조회
    const user = await this.userRepository.findByEmail(signinData.email);
    if (!user) {
      throw new Error('이메일 또는 패스워드가 올바르지 않습니다');
    }

    // 패스워드 검증
    const isPasswordValid = await this.authService.verifyPassword(
      signinData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('이메일 또는 패스워드가 올바르지 않습니다');
    }

    // JWT 토큰 생성
    const tokenPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
    };

    const accessToken = await this.authService.signAccessToken(tokenPayload);
    const refreshToken = await this.authService.signRefreshToken(tokenPayload);

    // 응답 생성
    const response = new SigninResponseDto(true, '로그인이 완료되었습니다', {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    });

    return {
      response,
      tokens: { accessToken, refreshToken },
    };
  }
}
