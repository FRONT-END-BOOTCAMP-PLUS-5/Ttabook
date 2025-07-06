import { UserType } from "@/app/api/domain/types/UserType"; 

export class SignupRequest {
  constructor(
    public email: string,
    public password: string,
    public type: UserType,
    public name: string
  ) {}
}