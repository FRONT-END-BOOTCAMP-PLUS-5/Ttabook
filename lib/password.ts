import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from './config';

// Runtime validation of bcryptjs library
function validateBcryptLibrary() {
  if (!bcrypt) {
    throw new Error('bcryptjs library is not properly loaded or configured');
  }

  // Check if essential functions exist (but skip validation in test environment when functions are mocked)
  if (
    process.env.NODE_ENV !== 'test' &&
    (typeof bcrypt.genSalt !== 'function' ||
      typeof bcrypt.hash !== 'function' ||
      typeof bcrypt.compare !== 'function')
  ) {
    throw new Error('bcryptjs library is not properly loaded or configured');
  }
}

/**
 * 평문 패스워드를 bcrypt로 해시화합니다
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.trim() === '') {
    throw new Error('패스워드가 제공되지 않았습니다');
  }

  // Runtime validation of bcryptjs
  validateBcryptLibrary();

  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';

    // 더 자세한 컨텍스트 정보 추가
    const contextInfo = {
      bcryptRounds: BCRYPT_ROUNDS,
      passwordLength: plainPassword?.length || 0,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };

    console.error('Password hashing failed:', {
      error: errorMessage,
      context: contextInfo,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `패스워드 해시화 실패: ${errorMessage} (rounds: ${BCRYPT_ROUNDS})`
    );
  }
}

/**
 * 평문 패스워드와 해시된 패스워드를 비교하여 검증합니다
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || plainPassword.trim() === '') {
    throw new Error('패스워드가 제공되지 않았습니다');
  }

  if (!hashedPassword || hashedPassword.trim() === '') {
    throw new Error('해시된 패스워드가 제공되지 않았습니다');
  }

  // Runtime validation of bcryptjs
  validateBcryptLibrary();

  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    return isValid;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';
    throw new Error(`패스워드 검증 실패: ${errorMessage}`);
  }
}
