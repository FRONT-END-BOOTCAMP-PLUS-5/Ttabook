import { IAuthService } from '../../../common/domains/auth/interfaces/IAuthService';
import { UserRepository } from '../../../common/domains/repositories/UserRepository';
import { GetCurrentUserResponseDto } from '../dtos';

export class GetCurrentUserUsecase {
  constructor(
    private authService: IAuthService,
    private userRepository: UserRepository
  ) {}

  async execute(accessToken: string): Promise<GetCurrentUserResponseDto> {
    // 1. 액세스 토큰 검증 및 사용자 ID 추출
    let userPayload;
    try {
      userPayload = await this.authService.verifyAccessToken(accessToken);
    } catch (error) {
      if (error instanceof Error && error.name === 'JWTExpired') {
        throw new Error('액세스 토큰이 만료되었습니다. 새로고침하거나 다시 로그인해주세요');
      }
      throw new Error('유효하지 않은 액세스 토큰입니다');
    }

    // 2. 데이터베이스에서 최신 사용자 정보 조회
    const user = await this.userRepository.findById(userPayload.originalId);
    if (!user) {
      throw new Error('사용자 정보를 찾을 수 없습니다');
    }

    // 3. 응답 DTO 생성
    return new GetCurrentUserResponseDto(
      true,
      '사용자 정보 조회가 완료되었습니다',
      {
        id: user.id,
        email: user.email,
        name: user.name, // 데이터베이스에서 가져온 전체 사용자 정보
        type: user.type, // 정확한 필드명 사용
      }
    );
  }
}