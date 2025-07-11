import { RegisterUseCase } from '../../../signup/usecases/RegisterUseCase';
import { UserRepository } from '../../../../common/domains/repositories/UserRepository';
import { SignupRequest } from '../../../signup/dtos'; 

import { ValidationError } from '../../../signup/dtos';

// 모킹
jest.mock('../../../../common/infrastructures/utils/PasswordUtil');

// 테스팅 타입
type SignupOmitName = Omit<SignupRequest, "name">

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
    const userData : SignupOmitName = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user' as const,
      // name이 없음 - 실패해야 함
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData)).rejects.toThrow('검증 실패: name: 이름은 필수입니다.');
  });

  it('빈 이름이면 에러를 발생시켜야 한다', async () => {
    const userData : SignupRequest = {
      email: 'test@example.com',
      password: 'password123', 
      type: 'user' as const,
      name: '', // 빈 문자열
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData)).rejects.toThrow('검증 실패');
  });

  it('이름이 너무 짧으면 에러를 발생시켜야 한다', async () => {
    const userData : SignupRequest = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user' as const,
      name: 'A', // 1글자
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(registerUseCase.execute(userData)).rejects.toThrow(ValidationError);
    await expect(registerUseCase.execute(userData)).rejects.toThrow('검증 실패: name: 이름은 최소 2자 이상이어야 합니다.');
  });
});