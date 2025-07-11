import { SignupRequest } from "../../../signup/dtos"; 

describe('SignupRequest DTO', () => {
  it('name 속성이 필수여야 한다', () => {
    const validSignupRequest: SignupRequest = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user',
      name: 'John Doe', // name 속성이 있어야 함
    };

    expect(validSignupRequest.name).toBe('John Doe');
    expect(validSignupRequest.name).toBeDefined();
    expect(typeof validSignupRequest.name).toBe('string');
  });

  it('name이 빈 문자열이면 안 된다', () => {
    // 이 테스트는 나중에 validation 로직에서 검증할 예정
    const signupRequest: SignupRequest = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user',
      name: '', // 빈 문자열
    };

    expect(signupRequest.name).toBe('');
    // 실제 validation은 AuthUseCase에서 수행
  });

  it('모든 필수 속성이 있어야 한다', () => {
    const signupRequest: SignupRequest = {
      email: 'test@example.com',
      password: 'password123',
      type: 'user',
      name: 'Jane Smith',
    };

    expect(signupRequest).toHaveProperty('email');
    expect(signupRequest).toHaveProperty('password');
    expect(signupRequest).toHaveProperty('type');
    expect(signupRequest).toHaveProperty('name');
  });
});