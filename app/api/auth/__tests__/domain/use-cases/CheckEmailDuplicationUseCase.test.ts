import { CheckEmailDuplicationUseCase } from '../../../duplication/usecase/CheckEmailDuplicationUseCase';
import { UserRepository } from '../../../../domain/repository/UserRepository';
import { User } from '../../../../domain/entities/User';
import { ValidationError } from '../../../duplication/dto';

describe('CheckEmailDuplicationUseCase', () => {
  let checkEmailDuplicationUseCase: CheckEmailDuplicationUseCase;
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

    checkEmailDuplicationUseCase = new CheckEmailDuplicationUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('이메일이 이미 존재하는 경우 true를 반환해야 한다', async () => {
      const email = 'existing@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await checkEmailDuplicationUseCase.execute(email);

      expect(result).toBe(true);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('이메일이 존재하지 않는 경우 false를 반환해야 한다', async () => {
      const email = 'available@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await checkEmailDuplicationUseCase.execute(email);

      expect(result).toBe(false);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('유효하지 않은 이메일 형식일 때 ValidationError를 발생시켜야 한다', async () => {
      const invalidEmail = 'invalid-email';

      await expect(checkEmailDuplicationUseCase.execute(invalidEmail)).rejects.toThrow(ValidationError);
      await expect(checkEmailDuplicationUseCase.execute(invalidEmail)).rejects.toThrow('검증 실패: root: 유효하지 않은 이메일 형식입니다.');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('데이터베이스 오류 시 에러를 전파해야 한다', async () => {
      const email = 'test@example.com';
      mockUserRepository.findByEmail.mockRejectedValue(new Error('데이터베이스 연결 오류'));

      await expect(checkEmailDuplicationUseCase.execute(email)).rejects.toThrow('데이터베이스 연결 오류');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });
});