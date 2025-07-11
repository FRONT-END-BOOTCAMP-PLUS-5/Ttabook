import { LoginUseCase } from '../../../nextauth/usecases/LoginUseCase';
import { UserRepository } from '../../../../common/domains/repositories/UserRepository';
import { User } from '../../../../common/domains/entities/User';
import { LoginRequest } from '../../../nextauth/dtos/LoginRequest';
import { PasswordUtil } from '../../../../common/infrastructures/utils/PasswordUtil';
import {
  InvalidCredentialsError,
} from '../../../nextauth/dtos';

// PasswordUtil 모킹
jest.mock('../../../../common/infrastructures/utils/PasswordUtil');

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashedpassword123',
    'user',
    'Test User'
  );

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    loginUseCase = new LoginUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
    };

    it('올바른 자격증명으로 로그인해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(true);

      const result = await loginUseCase.execute(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 사용자로 로그인 시 InvalidCredentialsError를 발생시켜야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(credentials)).rejects.toThrow(InvalidCredentialsError);
      await expect(loginUseCase.execute(credentials)).rejects.toThrow('잘못된 이메일 또는 비밀번호입니다.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).not.toHaveBeenCalled();
    });

    it('잘못된 비밀번호로 로그인 시 InvalidCredentialsError를 발생시켜야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute(credentials)).rejects.toThrow(InvalidCredentialsError);
      await expect(loginUseCase.execute(credentials)).rejects.toThrow('잘못된 이메일 또는 비밀번호입니다.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
    });

    it('비밀번호 비교 실패 시 오류를 전파해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockRejectedValue(new Error('비교 실패'));

      await expect(loginUseCase.execute(credentials)).rejects.toThrow('비교 실패');
    });
  });
});