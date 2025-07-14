import { LogoutResponseDto } from '../dtos';

export class LogoutUsecase {
  async execute(): Promise<LogoutResponseDto> {
    // 로그아웃은 단순히 클라이언트 쿠키를 삭제하는 것으로 처리
    // 서버 측에서는 특별한 로직이 필요 없음 (JWT는 stateless)
    return new LogoutResponseDto(true, '로그아웃이 완료되었습니다');
  }
}
