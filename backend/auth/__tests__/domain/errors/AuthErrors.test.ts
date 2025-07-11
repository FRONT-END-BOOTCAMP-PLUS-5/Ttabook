import { AuthError as DuplicationAuthError, DuplicateEmailError, InvalidEmailFormatError } from '../../../duplications/dtos';
import { WeakPasswordError, AuthError as SignupAuthError } from '../../../signup/dtos';
import { InvalidCredentialsError, AuthError as NextAuthAuthError } from '../../../nextauth/dtos';

describe('AuthErrors', () => {
  describe('AuthError', () => {
    it('기본 AuthError를 생성해야 한다', () => {
      const error = new DuplicationAuthError('테스트 에러');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DuplicationAuthError);
      expect(error.message).toBe('테스트 에러');
      expect(error.name).toBe('AuthError');
    });
  });

  describe('DuplicateEmailError', () => {
    it('중복 이메일 에러를 생성해야 한다', () => {
      const email = 'test@example.com';
      const error = new DuplicateEmailError(email);
      
      expect(error).toBeInstanceOf(DuplicationAuthError);
      expect(error).toBeInstanceOf(DuplicateEmailError);
      expect(error.message).toBe(`이미 존재하는 이메일입니다: ${email}`);
      expect(error.name).toBe('DuplicateEmailError');
    });
  });

  describe('InvalidCredentialsError', () => {
    it('잘못된 자격증명 에러를 생성해야 한다', () => {
      const error = new InvalidCredentialsError();
      
      expect(error).toBeInstanceOf(NextAuthAuthError);
      expect(error).toBeInstanceOf(InvalidCredentialsError);
      expect(error.message).toBe('잘못된 이메일 또는 비밀번호입니다.');
      expect(error.name).toBe('InvalidCredentialsError');
    });
  });

  describe('WeakPasswordError', () => {
    it('약한 비밀번호 에러를 생성해야 한다', () => {
      const error = new WeakPasswordError();
      
      expect(error).toBeInstanceOf(SignupAuthError);
      expect(error).toBeInstanceOf(WeakPasswordError);
      expect(error.message).toBe('비밀번호는 최소 8자 이상이어야 합니다.');
      expect(error.name).toBe('WeakPasswordError');
    });
  });

  describe('InvalidEmailFormatError', () => {
    it('잘못된 이메일 형식 에러를 생성해야 한다', () => {
      const email = 'invalid-email';
      const error = new InvalidEmailFormatError(email);
      
      expect(error).toBeInstanceOf(DuplicationAuthError);
      expect(error).toBeInstanceOf(InvalidEmailFormatError);
      expect(error.message).toBe(`유효하지 않은 이메일 형식입니다: ${email}`);
      expect(error.name).toBe('InvalidEmailFormatError');
    });
  });
});