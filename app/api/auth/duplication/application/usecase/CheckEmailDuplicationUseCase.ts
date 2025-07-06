import { UserRepository } from '../../../../domain/repository';
import { ValidationError } from '../dto/ValidationError';
import { ZodError, z } from 'zod';

export class CheckEmailDuplicationUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: unknown): Promise<boolean> {
    // 이메일 형식 검증
    const emailSchema = z.string().email('유효하지 않은 이메일 형식입니다.');
    let validatedEmail: string;
    try {
      validatedEmail = emailSchema.parse(email);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }

    const existingUser = await this.userRepository.findByEmail(validatedEmail);
    return existingUser !== null;
  }
}