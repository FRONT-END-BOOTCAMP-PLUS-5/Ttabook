import { NextRequest } from 'next/server';
import { POST } from '../../signup/(adaptor)/route';
import { RegisterUseCase } from '../../signup/usecases/RegisterUseCase';
import { SupabaseUserRepository } from '../../../common/infrastructures/repositories/SbUserRepository';
import { DuplicateEmailError, ValidationError } from '../../signup/dtos';
import { User } from '../../../common/domains/entities/User';

// RegisterUseCase와 SupabaseUserRepository 모킹
jest.mock('../../signup/usecases/RegisterUseCase');
jest.mock('../../../common/infrastructures/repositories/SbUserRepository');

describe('POST /api/auth/signup', () => {
  let mockRegisterUseCase: jest.Mocked<RegisterUseCase>;
  let mockUserRepository: jest.Mocked<SupabaseUserRepository>;

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashedpassword123',
    'user',
    'Test User'
  );

  beforeEach(() => {
    mockUserRepository = new SupabaseUserRepository() as jest.Mocked<SupabaseUserRepository>;
    mockRegisterUseCase = new RegisterUseCase(mockUserRepository) as jest.Mocked<RegisterUseCase>;
    
    // RegisterUseCase 생성자 모킹
    (RegisterUseCase as jest.MockedClass<typeof RegisterUseCase>).mockImplementation(() => mockRegisterUseCase);
    
    jest.clearAllMocks();
  });

  describe('성공 케이스', () => {
    it('유효한 회원가입 요청 시 SignupResponse DTO로 응답해야 한다', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'validpassword123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        message: '사용자 등록이 완료되었습니다.',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          type: mockUser.type,
          name: mockUser.name,
          // password는 응답에 포함되지 않음
        },
      });
      expect(responseData.user.password).toBeUndefined();
    });
  });

  describe('검증 실패 케이스', () => {
    it('필수 필드가 누락된 경우 ValidationError를 발생시켜야 한다', async () => {
      const requestBody = {}; // 모든 필드 누락

      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError([
          { path: 'email', message: '이메일은 필수입니다.' },
          { path: 'password', message: '비밀번호는 필수입니다.' },
          { path: 'name', message: '이름은 필수입니다.' }
        ])
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('검증 실패');
    });
  });

  describe('도메인 에러 처리', () => {
    it('중복 이메일 에러 시 409 Conflict를 반환해야 한다', async () => {
      const requestBody = {
        email: 'existing@example.com',
        password: 'validpassword123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockRejectedValue(new DuplicateEmailError('existing@example.com'));

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData).toEqual({
        error: '이미 존재하는 이메일입니다: existing@example.com',
      });
    });

    it('잘못된 이메일 형식 에러 시 400 Bad Request를 반환해야 한다', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'validpassword123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError([{ path: 'email', message: '유효하지 않은 이메일 형식입니다.' }])
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '검증 실패: email: 유효하지 않은 이메일 형식입니다.',
      });
    });

    it('약한 비밀번호 에러 시 400 Bad Request를 반환해야 한다', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: '123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError([{ path: 'password', message: '비밀번호는 최소 8자 이상이어야 합니다.' }])
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '검증 실패: password: 비밀번호는 최소 8자 이상이어야 합니다.',
      });
    });

    it('유효하지 않은 이름 에러 시 400 Bad Request를 반환해야 한다', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'validpassword123',
        type: 'user',
        name: 'A',
      };

      mockRegisterUseCase.execute.mockRejectedValue(
        new ValidationError([{ path: 'name', message: '이름은 최소 2자 이상이어야 합니다.' }])
      );

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '검증 실패: name: 이름은 최소 2자 이상이어야 합니다.',
      });
    });

    it('알 수 없는 에러 시 500 Internal Server Error를 반환해야 한다', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'validpassword123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockRejectedValue(new Error('알 수 없는 시스템 오류'));

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: '알 수 없는 시스템 오류',
      });
    });
  });

  describe('팩토리 패턴', () => {
    it('각 요청마다 새로운 RegisterUseCase 인스턴스를 생성해야 한다', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'validpassword123',
        type: 'user',
        name: 'Test User',
      };

      mockRegisterUseCase.execute.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      // RegisterUseCase 생성자가 호출되었는지 확인
      expect(RegisterUseCase).toHaveBeenCalledWith(expect.any(SupabaseUserRepository));
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(requestBody);
    });
  });
});