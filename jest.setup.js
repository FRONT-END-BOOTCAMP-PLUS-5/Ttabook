import '@testing-library/jest-dom';
import util from 'node:util';
import { jest } from '@jest/globals';

// 테스트 환경 변수 설정
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests-that-is-long-enough';
process.env.BCRYPT_ROUNDS = '12';
process.env.NODE_ENV = 'test';

// Node.js 환경 폴리필
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}

// crypto 모듈 polyfill
import { webcrypto } from 'node:crypto';
if (typeof global.crypto === 'undefined') {
  global.crypto = webcrypto;
}

// structuredClone 폴리필 (Node.js 18+에서 필요)
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Request/Response 폴리필 (jsdom 환경용)
import { Request, Response } from 'whatwg-fetch';
if (typeof global.Request === 'undefined') {
  global.Request = Request;
}
if (typeof global.Response === 'undefined') {
  global.Response = Response;
}

// Global mocks for Node.js environment
global.fetch = global.fetch || require('whatwg-fetch').fetch;

// 공통 Mock 설정
global.mockSupabaseClient = null;
global.createMockSupabaseClient = () => {
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  };

  mockSelect.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
  });
  mockInsert.mockReturnValue({
    select: mockSelect,
    single: mockSingle,
  });
  mockEq.mockReturnValue({
    single: mockSingle,
  });

  return {
    client: mockSupabaseClient,
    mocks: {
      select: mockSelect,
      insert: mockInsert,
      eq: mockEq,
      single: mockSingle,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
};

beforeEach(() => {
  // Next.js headers 모킹
  jest.unstable_mockModule('next/headers', () => ({
    cookies: jest.fn(() => ({
      getAll: jest.fn(() => []),
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    })),
  }));
});
