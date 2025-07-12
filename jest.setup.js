import '@testing-library/jest-dom';
import util from "node:util";

// 테스트 환경 변수 설정
process.env.SUPABASE_URL = 'https://mfcpraoswvozanstcguf.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.BCRYPT_ROUNDS = '10';

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
