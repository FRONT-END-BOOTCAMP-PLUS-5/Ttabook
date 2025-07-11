import '@testing-library/jest-dom';
import util from "node:util";

// 테스트 환경 변수 설정
process.env.NEXTAUTH_SECRET = 'yc7MFsGob/0KcqHF9LcAeV4O8NeDDDopRUzJEBjJkOM=';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mfcpraoswvozanstcguf.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Node.js 환경 폴리필
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}
