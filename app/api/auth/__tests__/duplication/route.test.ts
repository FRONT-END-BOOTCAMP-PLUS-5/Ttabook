import { NextRequest } from 'next/server';
import { GET } from '../../duplication/(adaptor)/route';
import { CheckEmailDuplicationUseCase } from '../../application/usecases/CheckEmailDuplicationUseCase';
import { SupabaseUserRepository } from '../../../infrastructure/repositories/SbUserRepository';
import { ValidationError } from '../../application/dto';

// CheckEmailDuplicationUseCase와 SupabaseUserRepository 모킹
jest.mock('../../application/usecases/CheckEmailDuplicationUseCase');
jest.mock('../../../infrastructure/repositories/SbUserRepository');

describe('GET /api/auth/duplication', () => {
  let mockCheckEmailDuplicationUseCase: jest.Mocked<CheckEmailDuplicationUseCase>;
  let mockUserRepository: jest.Mocked<SupabaseUserRepository>;

  beforeEach(() => {
    mockUserRepository = new SupabaseUserRepository() as jest.Mocked<SupabaseUserRepository>;
    mockCheckEmailDuplicationUseCase = new CheckEmailDuplicationUseCase(mockUserRepository) as jest.Mocked<CheckEmailDuplicationUseCase>;
    
    // CheckEmailDuplicationUseCase 생성자 모킹
    (CheckEmailDuplicationUseCase as jest.MockedClass<typeof CheckEmailDuplicationUseCase>).mockImplementation(() => mockCheckEmailDuplicationUseCase);
    
    jest.clearAllMocks();
  });

  describe('성공 케이스', () => {
    it('사용 가능한 이메일인 경우 available: true를 반환해야 한다', async () => {
      const email = 'available@example.com';
      mockCheckEmailDuplicationUseCase.execute.mockResolvedValue(false); // 중복 없음

      const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${email}`, {
        method: 'GET',
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        email: email,
        available: true,
        message: '사용 가능한 이메일입니다.',
      });
      expect(mockCheckEmailDuplicationUseCase.execute).toHaveBeenCalledWith(email);
    });

    it('이미 사용 중인 이메일인 경우 available: false를 반환해야 한다', async () => {
      const email = 'taken@example.com';
      mockCheckEmailDuplicationUseCase.execute.mockResolvedValue(true); // 중복 있음

      const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${email}`, {
        method: 'GET',
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        email: email,
        available: false,
        message: '이미 사용 중인 이메일입니다.',
      });
      expect(mockCheckEmailDuplicationUseCase.execute).toHaveBeenCalledWith(email);
    });
  });

  describe('검증 실패 케이스', () => {
    it('이메일 파라미터가 없는 경우 400 에러를 반환해야 한다', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/duplication', {
        method: 'GET',
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '이메일 파라미터가 필요합니다.',
      });
      expect(mockCheckEmailDuplicationUseCase.execute).not.toHaveBeenCalled();
    });

    it('유효하지 않은 이메일 형식인 경우 400 에러를 반환해야 한다', async () => {
      const invalidEmail = 'invalid-email';
      
      // 유효하지 않은 이메일일 때 ValidationError 발생시키도록 설정
      mockCheckEmailDuplicationUseCase.execute.mockRejectedValue(
        new ValidationError([{ path: 'root', message: '유효하지 않은 이메일 형식입니다.' }])
      );
      
      const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${invalidEmail}`, {
        method: 'GET',
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: '검증 실패: root: 유효하지 않은 이메일 형식입니다.',
      });
      expect(mockCheckEmailDuplicationUseCase.execute).toHaveBeenCalledWith(invalidEmail);
    });
  });

  describe('에러 처리', () => {
    it('시스템 오류 시 500 에러를 반환해야 한다', async () => {
      const email = 'test@example.com';
      mockCheckEmailDuplicationUseCase.execute.mockRejectedValue(new Error('데이터베이스 연결 오류'));

      const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${email}`, {
        method: 'GET',
      });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: '데이터베이스 연결 오류',
      });
    });
  });

  describe('인라인 팩토리 패턴', () => {
    it('각 요청마다 새로운 CheckEmailDuplicationUseCase 인스턴스를 생성해야 한다', async () => {
      const email = 'test@example.com';
      mockCheckEmailDuplicationUseCase.execute.mockResolvedValue(false);

      const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${email}`, {
        method: 'GET',
      });

      await GET(request);

      // CheckEmailDuplicationUseCase 생성자가 호출되었는지 확인
      expect(CheckEmailDuplicationUseCase).toHaveBeenCalledWith(expect.any(SupabaseUserRepository));
      expect(mockCheckEmailDuplicationUseCase.execute).toHaveBeenCalledWith(email);
    });
  });
});