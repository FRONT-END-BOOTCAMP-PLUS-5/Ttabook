import { UserType } from "@/backend/common/domains/types/UserType"; 

export class SignupRequest {
  constructor(
    public email: string,
    public password: string,
    public type: UserType,
    public name: string
  ) {}
}