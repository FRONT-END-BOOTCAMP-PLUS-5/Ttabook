// bcrypt 모킹
export const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

jest.mock('bcrypt', () => mockBcrypt);