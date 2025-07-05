import { SignupResponse } from "../../../signup/dto";

describe('SignupResponse DTO', () => {
  it('user 객체에 name 속성이 포함되어야 한다', () => {
    const signupResponse: SignupResponse = {
      message: '사용자 등록이 완료되었습니다.',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        type: 'user',
        name: 'John Doe', // name 속성이 응답에 포함되어야 함
      },
    };

    expect(signupResponse.user.name).toBe('John Doe');
    expect(signupResponse.user.name).toBeDefined();
    expect(typeof signupResponse.user.name).toBe('string');
  });

  it('응답에 password는 포함되지 않아야 한다', () => {
    const signupResponse: SignupResponse = {
      message: '사용자 등록이 완료되었습니다.',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        type: 'user',
        name: 'Jane Smith',
      },
    };

    expect(signupResponse.user).not.toHaveProperty('password');
    expect(signupResponse.user).toHaveProperty('name');
  });

  it('모든 필수 user 속성이 있어야 한다', () => {
    const signupResponse: SignupResponse = {
      message: '사용자 등록이 완료되었습니다.',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com', 
        type: 'user',
        name: 'Test User',
      },
    };

    expect(signupResponse.user).toHaveProperty('id');
    expect(signupResponse.user).toHaveProperty('email');
    expect(signupResponse.user).toHaveProperty('type');
    expect(signupResponse.user).toHaveProperty('name');
  });
});