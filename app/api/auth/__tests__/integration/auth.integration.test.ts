import '../__mocks__/supabase.mock';
import '../__mocks__/bcrypt.mock';
import { AuthUseCase } from '../../domain/usecases/AuthUseCase';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SbUserRepository';
import { mockSupabaseClient } from '../__mocks__/supabase.mock';
import { mockBcrypt } from '../__mocks__/bcrypt.mock';
import { User } from '../../../domain/entities/User';

describe('Auth Integration Tests', () => {
  let authUseCase: AuthUseCase;
  let userRepository: SupabaseUserRepository;

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashedpassword123',
    'user',
    'Test User'
  );

  beforeEach(() => {
    userRepository = new SupabaseUserRepository();
    authUseCase = new AuthUseCase(userRepository);
    jest.clearAllMocks();
  });

  describe('사용자 등록 및 로그인 플로우', () => {
    it('사용자를 등록하고 로그인할 수 있어야 한다', async () => {
      // 사용자 등록
      const userData = {
        email: 'test@example.com',
        password: 'plainpassword123',
        type: 'user' as const,
        name: 'Test User',
      };

      // 이메일 중복 체크 - 없음
      const mockEmailCheck = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        }),
      };
      
      // 사용자 생성
      const mockCreate = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      // 로그인 시 사용자 조회
      const mockLoginCheck = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockEmailCheck) }) // 이메일 중복 체크
        .mockReturnValueOnce({ insert: jest.fn().mockReturnValue(mockCreate) }) // 사용자 생성
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockLoginCheck) }); // 로그인

      mockBcrypt.hash.mockResolvedValue('hashedpassword123');
      mockBcrypt.compare.mockResolvedValue(true);

      // 등록
      const registeredUser = await authUseCase.register(userData);
      expect(registeredUser).toEqual(mockUser);

      // 로그인
      const loggedInUser = await authUseCase.login({
        email: userData.email,
        password: userData.password,
      });

      expect(loggedInUser).toEqual(mockUser);
    });

    it('이미 존재하는 이메일로 등록 시 실패해야 한다', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'plainpassword123',
        type: 'user' as const,
        name: 'Test User',
      };

      // 이메일 중복 체크 - 존재함
      const mockEmailCheck = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockEmailCheck),
      });

      await expect(authUseCase.register(userData)).rejects.toThrow('이미 존재하는 이메일입니다: test@example.com');
    });

    it('잘못된 비밀번호로 로그인 시 실패해야 한다', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUserCheck = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockUserCheck),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      await expect(authUseCase.login(credentials)).rejects.toThrow('잘못된 이메일 또는 비밀번호입니다.');
    });
  });
});