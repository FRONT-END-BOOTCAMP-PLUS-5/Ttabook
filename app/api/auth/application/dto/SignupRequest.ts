import { UserType } from '../../../domain/types/UserType';

export interface SignupRequest {
  email: string;
  password: string;
  type: UserType;
}