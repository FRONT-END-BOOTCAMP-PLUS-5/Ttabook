import { IAuthService } from '@/backend/common/domains/auth/interfaces/IAuthService';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from '../dtos';

export class RefreshTokenUsecase {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(refreshData: RefreshTokenRequestDto): Promise<{ response: RefreshTokenResponseDto; tokens: { accessToken: string; refreshToken: string } }> {
    // 리프레시 토큰 검증
    let userPayload;
    try {
      userPayload = await this.authService.verifyRefreshToken(refreshData.refreshToken);
    } catch (error) {
      if (error instanceof Error && error.name === 'JWTExpired') {
        throw new Error('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요');
      }
      throw new Error('유효하지 않은 리프레시 토큰입니다');
    }

    // 새로운 토큰 생성 (JWT payload를 UserForJWT 형태로 변환)
    // 하위 호환성: originalId가 없으면 id 사용
    const userId = userPayload.originalId || userPayload.id;
    const tokenPayload = {
      id: userId,
      email: userPayload.email,
      type: userPayload.role, // role을 type으로 변환
    };

    const newAccessToken = await this.authService.signAccessToken(tokenPayload);
    const newRefreshToken = await this.authService.signRefreshToken(tokenPayload);

    // 응답 생성
    const response = new RefreshTokenResponseDto(
      true,
      '토큰이 갱신되었습니다'
    );

    return {
      response,
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  }
}