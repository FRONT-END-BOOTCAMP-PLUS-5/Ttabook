import { UserType } from '../../../domain/types/UserType';

// 회원가입 성공 응답 DTO
export interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    type: UserType;
    name: string;
    // 보안상 password는 제외
  };
}

// 에러 응답 DTO  
export interface SignupErrorResponse {
  error: string;
}