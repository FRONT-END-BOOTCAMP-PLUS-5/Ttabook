import { User } from '../entities/User';
import { SignupRequest } from '@/backend/auth/signup/dtos/SignupRequest';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(userData: SignupRequest): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}