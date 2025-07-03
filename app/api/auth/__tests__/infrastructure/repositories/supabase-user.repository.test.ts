import '../../__mocks__/supabase.mock';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/supabase-user.repository';
import { mockSupabaseClient } from '../../__mocks__/supabase.mock';
import { User, CreateUserData } from '../../../domain/entities/user.entity';

describe('SupabaseUserRepository', () => {
  let repository: SupabaseUserRepository;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword123',
    type: 'user',
  };

  beforeEach(() => {
    repository = new SupabaseUserRepository();
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 찾아야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain),
      });

      const result = await repository.findByEmail('test@example.com');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockChain.eq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('사용자를 찾지 못했을 때 null을 반환해야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain),
      });

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('데이터베이스 오류 시 에러를 발생시켜야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST001', message: 'Database error' } 
        }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain),
      });

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow('사용자 조회 중 오류 발생: Database error');
    });
  });

  describe('findById', () => {
    it('ID로 사용자를 찾아야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockChain),
      });

      const result = await repository.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('새로운 사용자를 생성해야 한다', async () => {
      const userData: CreateUserData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        type: 'user',
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockChain),
      });

      const result = await repository.create(userData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockChain.select).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('사용자 생성 실패 시 에러를 발생시켜야 한다', async () => {
      const userData: CreateUserData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        type: 'user',
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Insert failed' } 
        }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockChain),
      });

      await expect(repository.create(userData)).rejects.toThrow('사용자 생성 중 오류 발생: Insert failed');
    });
  });

  describe('update', () => {
    it('사용자 정보를 업데이트해야 한다', async () => {
      const updateData = { email: 'updated@example.com' };
      const updatedUser = { ...mockUser, email: 'updated@example.com' };

      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedUser, error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      });

      const result = await repository.update('123e4567-e89b-12d3-a456-426614174000', updateData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('사용자를 삭제해야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      });

      await repository.delete('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    });

    it('사용자 삭제 실패 시 에러를 발생시켜야 한다', async () => {
      const mockChain = {
        eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      };
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      });

      await expect(repository.delete('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow('사용자 삭제 중 오류 발생: Delete failed');
    });
  });
});