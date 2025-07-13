import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SupabaseUserRepository } from '@/backend/common/infrastructures/repositories/SbUserRepository';
import { User } from '@/backend/common/domains/entities/User';

// Supabase 모킹
const mockSupabaseClient = {
  from: jest.fn(),
};

const mockQueryBuilder = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('SupabaseUserRepository', () => {
  let repository: SupabaseUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    // 체이닝 메서드 설정
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.single.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);

    mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

    repository = new SupabaseUserRepository(mockSupabaseClient as any);
  });

  describe('findByEmail', () => {
    const testUser: User = {
      id: 'test-uuid-123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      type: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('이메일로 사용자를 성공적으로 조회해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: testUser,
        error: null,
      });

      const result = await repository.findByEmail('test@example.com');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'email',
        'test@example.com'
      );
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('사용자를 찾을 수 없으면 null을 반환해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('데이터베이스 에러 시 예외를 발생시켜야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Database connection failed' },
      });

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow(
        '사용자 조회 중 오류 발생: Database connection failed'
      );
    });
  });

  describe('findById', () => {
    const testUser: User = {
      id: 'test-uuid-456',
      email: 'findbyid@example.com',
      name: 'Find By ID User',
      password: 'hashed-password',
      type: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('ID로 사용자를 성공적으로 조회해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: testUser,
        error: null,
      });

      const result = await repository.findById('test-uuid-456');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'test-uuid-456');
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('사용자를 찾을 수 없으면 null을 반환해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await repository.findById('nonexistent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    const newUserData: Omit<User, 'id'> = {
      email: 'new@example.com',
      name: 'New User',
      password: 'hashed-password',
      type: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const savedUser: User = {
      id: 'new-uuid-789',
      ...newUserData,
    };

    it('새 사용자를 성공적으로 저장해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: savedUser,
        error: null,
      });

      const result = await repository.save(newUserData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith([newUserData]);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it('저장 실패 시 예외를 발생시켜야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint',
        },
      });

      await expect(repository.save(newUserData)).rejects.toThrow(
        '사용자 생성 중 오류 발생: duplicate key value violates unique constraint'
      );
    });
  });

  describe('update', () => {
    const updateData: Partial<User> = {
      name: 'Updated Name',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    const updatedUser: User = {
      id: 'update-uuid-123',
      email: 'update@example.com',
      name: 'Updated Name',
      password: 'hashed-password',
      type: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    it('사용자를 성공적으로 업데이트해야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: updatedUser,
        error: null,
      });

      const result = await repository.update('update-uuid-123', updateData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'update-uuid-123');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.single).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('업데이트 실패 시 예외를 발생시켜야 한다', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Database connection failed' },
      });

      await expect(
        repository.update('update-uuid-123', updateData)
      ).rejects.toThrow(
        '사용자 업데이트 중 오류 발생: Database connection failed'
      );
    });
  });

  describe('delete', () => {
    it('사용자를 성공적으로 삭제해야 한다', async () => {
      mockQueryBuilder.eq.mockResolvedValue({
        error: null,
      });

      await repository.delete('delete-uuid-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'delete-uuid-123');
    });

    it('삭제 실패 시 예외를 발생시켜야 한다', async () => {
      mockQueryBuilder.eq.mockResolvedValue({
        error: { code: 'PGRST301', message: 'Database connection failed' },
      });

      await expect(repository.delete('delete-uuid-123')).rejects.toThrow(
        '사용자 삭제 중 오류 발생: Database connection failed'
      );
    });
  });
});
