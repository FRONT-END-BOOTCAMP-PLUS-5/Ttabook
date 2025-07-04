// NextAuth와 설정 모킹
jest.mock('next-auth', () => {
  const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
  return jest.fn(() => mockHandler);
});

jest.mock('../../../infrastructure/next-auth/AuthConfig', () => ({
  authOptions: {}
}));

import { GET, POST } from '../../[...nextauth]/route';
import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';

describe('/api/auth/[...nextauth]', () => {
  const mockRequest = {} as NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    // NextAuth가 반환하는 핸들러를 가져옴
    mockHandler = (NextAuth as jest.Mock)();
    jest.clearAllMocks();
  });

  it('NextAuth 핸들러가 올바르게 설정되어야 한다', () => {
    // NextAuth 모듈이 함수로 정의되어 있는지 확인
    expect(typeof NextAuth).toBe('function');
  });

  it('GET 핸들러가 NextAuth 핸들러를 호출해야 한다', async () => {
    await GET(mockRequest);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
  });

  it('POST 핸들러가 NextAuth 핸들러를 호출해야 한다', async () => {
    await POST(mockRequest);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
  });

  it('GET과 POST 핸들러가 함수여야 한다', () => {
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });
});