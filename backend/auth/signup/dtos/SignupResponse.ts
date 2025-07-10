import { UserType } from "@/backend/common/domains/types/UserType"; 

// 회원가입 성공 응답 DTO
export class SignupResponse {
  constructor(
    public message: string,
    public user: {
      id: string;
      email: string;
      type: UserType;
      name: string;
      // 보안상 password는 제외
    }
  ) {}
}

// 에러 응답 DTO  
export class SignupErrorResponse {
  constructor(public error: string) {}
}