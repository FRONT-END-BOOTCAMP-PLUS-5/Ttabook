import { CookieService } from '@/backend/common/infrastructures/auth';
import { NextRequest, NextResponse } from 'next/server';

export function isValidEmail(email: string): boolean {
  // RFC 5322에 기반한 일반적인 이메일 정규식 (완벽하지는 않지만 대부분의 경우 유효)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/*
 * 비밀번호가 조건
 * 1. 최소 8자 이상
 * 2. 하나 이상의 특수문자 포함
 * 3. 하나 이상의 영어 대문자 또는 소문자 포함
 * 4. 하나 이상의 숫자 포함
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return false;
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  if (!hasLetter) {
    return false;
  }

  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return false;
  }

  return true;
}

export const tokenValidation = (request: NextRequest): boolean => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return false;
  }

  const cookieService = new CookieService();
  const accessToken = cookieService.extractTokenFromCookies(
    cookieHeader,
    'accessToken'
  );
  if (!accessToken || accessToken.trim() === '') {
    return false;
  }
  return true;
};
