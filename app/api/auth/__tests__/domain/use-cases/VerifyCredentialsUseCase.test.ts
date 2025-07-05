import { VerifyCredentialsUseCase } from '../../../[...nextauth]/application/usecase/VerifyCredentialsUseCase';
import { UserRepository } from '../../../../domain/repository/UserRepository';
import { User } from '../../../../domain/entities/User';
import { LoginRequest } from '../../../[...nextauth]/application/dto/LoginRequest';
import { PasswordUtil } from '../../../../infrastructure/utils/PasswordUtil';

// PasswordUtil 모킹
jest.mock('../../../../infrastructure/utils/PasswordUtil');

describe('VerifyCredentialsUseCase', () => {
  let verifyCredentialsUseCase: VerifyCredentialsUseCase;
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

    verifyCredentialsUseCase = new VerifyCredentialsUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
    };

    it('올바른 자격증명으로 사용자를 반환해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyCredentialsUseCase.execute(credentials);

      expect(result).toEqual(mockUser);
    });

    it('잘못된 자격증명일 때 null을 반환해야 한다 (예외 전파하지 않음)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await verifyCredentialsUseCase.execute(credentials);

      expect(result).toBeNull();
    });

    it('잘못된 비밀번호일 때 null을 반환해야 한다 (예외 전파하지 않음)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyCredentialsUseCase.execute(credentials);

      expect(result).toBeNull();
    });

    it('InvalidCredentialsError가 아닌 다른 에러는 그대로 전파해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (PasswordUtil.compare as jest.Mock).mockRejectedValue(new Error('시스템 오류'));

      await expect(verifyCredentialsUseCase.execute(credentials)).rejects.toThrow('시스템 오류');
    });
  });
});