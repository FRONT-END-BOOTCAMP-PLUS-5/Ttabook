import { NextRequest } from 'next/server';
import { GET } from '../../duplications/(adaptor)/route';

// 통합 테스트를 위한 최소한의 모킹
jest.mock('../../../common/infrastructures/repositories/SbUserRepository', () => ({
  SupabaseUserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn().mockResolvedValue(null), // 기본적으로 사용 가능한 이메일로 설정
  })),
}));

describe('GET /api/auth/duplication - 통합 테스트', () => {
  it('전체 플로우가 올바르게 동작해야 한다', async () => {
    // 실제 구현에서는 실제 데이터베이스를 사용하지만,
    // 테스트 환경에서는 모킹된 데이터베이스를 사용
    const email = 'integration-test@example.com';
    const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${email}`, {
      method: 'GET',
    });

    const response = await GET(request);
    const responseData = await response.json();

    // 응답이 올바른 구조를 가지고 있는지 확인
    expect(response.status).toBe(200);
    expect(responseData).toHaveProperty('email');
    expect(responseData).toHaveProperty('available');
    expect(responseData).toHaveProperty('message');
    expect(responseData.email).toBe(email);
    expect(typeof responseData.available).toBe('boolean');
    expect(typeof responseData.message).toBe('string');
  });

  it('잘못된 이메일 형식에 대한 전체 플로우가 올바르게 동작해야 한다', async () => {
    const invalidEmail = 'invalid-email';
    const request = new NextRequest(`http://localhost:3000/api/auth/duplication?email=${invalidEmail}`, {
      method: 'GET',
    });

    const response = await GET(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toHaveProperty('error');
    expect(responseData.error).toBe('검증 실패: root: 유효하지 않은 이메일 형식입니다.');
  });

  it('이메일 파라미터가 없는 경우 전체 플로우가 올바르게 동작해야 한다', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/duplication', {
      method: 'GET',
    });

    const response = await GET(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toHaveProperty('error');
    expect(responseData.error).toBe('이메일 파라미터가 필요합니다.');
  });
});