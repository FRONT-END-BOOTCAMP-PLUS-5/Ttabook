import { RegisterUseCase } from '../../../signup/application/usecase/RegisterUseCase';
import { UserRepository } from '../../../../domain/repository/UserRepository';
import { User } from '../../../../domain/entities/User';

import { ValidationError } from '../../../signup/application/dto';

// 모킹
jest.mock('../../../../infrastructure/utils/PasswordUtil');

describe('Name Validation in RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    registerUseCase = new RegisterUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  it('이름이 없으면 에러를 발생시켜야 한다', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user' as const,
      // name이 없음 - 실패해야 함
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData as any)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData as any)).rejects.toThrow('검증 실패: name: 이름은 필수입니다.');
  });

  it('빈 이름이면 에러를 발생시켜야 한다', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123', 
      type: 'user' as const,
      name: '', // 빈 문자열
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData as any)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData as any)).rejects.toThrow('검증 실패');
  });

  it('이름이 너무 짧으면 에러를 발생시켜야 한다', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user' as const,
      name: 'A', // 1글자
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData as any)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData as any)).rejects.toThrow('검증 실패: name: 이름은 최소 2자 이상이어야 합니다.');
  });
});