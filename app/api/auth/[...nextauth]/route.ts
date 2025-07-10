import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/backend/common/infrastructure/next-auth/AuthConfig';

const handler = NextAuth(authOptions);

// NextAuth 핸들러를 Next.js App Router API 라우트 타입으로 변환
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}