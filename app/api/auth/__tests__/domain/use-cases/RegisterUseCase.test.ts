import { RegisterUseCase } from '../../../signup/usecase/RegisterUseCase';
import { UserRepository } from '../../../../domain/repository/UserRepository';
import { User } from '../../../../domain/entities/User';
import { SignupRequest } from '../../../signup/dto/SignupRequest';
import { PasswordUtil } from '../../../../infrastructure/utils/PasswordUtil';
import {
  DuplicateEmailError,
  ValidationError,
} from '../../../signup/dto';

// PasswordUtil 모킹
jest.mock('../../../../infrastructure/utils/PasswordUtil');

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userData: SignupRequest = {
      email: 'test@example.com',
      password: 'plainpassword123',
      type: 'user',
      name: 'Test User',
    };

    it('새로운 사용자를 성공적으로 등록해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (PasswordUtil.hash as jest.Mock).mockResolvedValue('hashedpassword123');

      const result = await registerUseCase.execute(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(PasswordUtil.hash).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...userData,
        password: 'hashedpassword123',
      });
      expect(result).toEqual(mockUser);
    });

    it('이미 존재하는 이메일로 등록 시 DuplicateEmailError를 발생시켜야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(userData)).rejects.toThrow(DuplicateEmailError);
      await expect(registerUseCase.execute(userData)).rejects.toThrow(`이미 존재하는 이메일입니다: ${userData.email}`);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('잘못된 이메일 형식으로 등록 시 ValidationError를 발생시켜야 한다', async () => {
      const invalidEmailData = { ...userData, email: 'invalid-email' };

      await expect(registerUseCase.execute(invalidEmailData)).rejects.toThrow(ValidationError);
      await expect(registerUseCase.execute(invalidEmailData)).rejects.toThrow('검증 실패: email: 유효하지 않은 이메일 형식입니다.');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('약한 비밀번호로 등록 시 ValidationError를 발생시켜야 한다', async () => {
      const weakPasswordData = { ...userData, password: '123' }; // 8자 미만

      await expect(registerUseCase.execute(weakPasswordData)).rejects.toThrow(ValidationError);
      await expect(registerUseCase.execute(weakPasswordData)).rejects.toThrow('검증 실패: password: 비밀번호는 최소 8자 이상이어야 합니다.');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('유효하지 않은 이름으로 등록 시 ValidationError를 발생시켜야 한다', async () => {
      const invalidNameData = { ...userData, name: 'A' }; // 2자 미만

      await expect(registerUseCase.execute(invalidNameData)).rejects.toThrow(ValidationError);
      await expect(registerUseCase.execute(invalidNameData)).rejects.toThrow('검증 실패: name: 이름은 최소 2자 이상이어야 합니다.');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('이메일 형식과 비밀번호 검증을 통과한 후 중복 이메일 확인을 해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (PasswordUtil.hash as jest.Mock).mockResolvedValue('hashedpassword123');

      await registerUseCase.execute(userData);

      // 검증 순서 확인: 이메일 형식 → 비밀번호 강도 → 중복 확인
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
    });

    it('비밀번호 해싱 실패 시 오류를 전파해야 한다', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (PasswordUtil.hash as jest.Mock).mockRejectedValue(new Error('해싱 실패'));

      await expect(registerUseCase.execute(userData)).rejects.toThrow('해싱 실패');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});