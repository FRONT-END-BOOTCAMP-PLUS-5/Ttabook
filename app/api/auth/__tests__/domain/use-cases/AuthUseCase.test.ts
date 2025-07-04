import { AuthUseCase } from '../../../domain/usecases/AuthUseCase';
import { UserRepository } from '../../../../domain/repository/UserRepository';
import { User } from '../../../../domain/entities/User';
import { SignupRequest } from '../../application/dto/SignupRequest';
import { LoginRequest } from '../../application/dto/LoginRequest';
import { PasswordUtil } from '../../../../infrastructure/utils/PasswordUtil';

// PasswordUtil 모킹
jest.mock('../../../../infrastructure/utils/PasswordUtil');

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword123',
    type: 'user',
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    authUseCase = new AuthUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const userData: SignupRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
      type: 'user',
    };

    it('새로운 사용자를 성공적으로 등록해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (PasswordUtil.hash as jest.Mock).mockResolvedValue('hashedpassword123');

      const result = await authUseCase.register(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(PasswordUtil.hash).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...userData,
        password: 'hashedpassword123',
      });
      expect(result).toEqual(mockUser);
    });

    it('이미 존재하는 이메일로 등록 시 오류를 발생시켜야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authUseCase.register(userData)).rejects.toThrow('이미 존재하는 이메일입니다.');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('비밀번호 해싱 실패 시 오류를 전파해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (PasswordUtil.hash as jest.Mock).mockRejectedValue(new Error('해싱 실패'));

      await expect(authUseCase.register(userData)).rejects.toThrow('해싱 실패');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
    };

    it('올바른 자격증명으로 로그인해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(true);

      const result = await authUseCase.login(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 사용자로 로그인 시 null을 반환해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authUseCase.login(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('잘못된 비밀번호로 로그인 시 null을 반환해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(false);

      const result = await authUseCase.login(credentials);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(PasswordUtil.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(result).toBeNull();
    });

    it('비밀번호 비교 실패 시 오류를 전파해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockRejectedValue(new Error('비교 실패'));

      await expect(authUseCase.login(credentials)).rejects.toThrow('비교 실패');
    });
  });

  describe('verifyCredentials', () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
    };

    it('login 메서드를 호출해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(true);

      const result = await authUseCase.verifyCredentials(credentials);

      expect(result).toEqual(mockUser);
    });
  });
});