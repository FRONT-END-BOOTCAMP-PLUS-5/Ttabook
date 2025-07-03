import '../../__mocks__/bcrypt.mock';
import { PasswordUtil } from '../../../infrastructure/utils/password.util';
import { mockBcrypt } from '../../__mocks__/bcrypt.mock';

describe('PasswordUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('비밀번호를 올바르게 해싱해야 한다', async () => {
      const password = 'testpassword123';
      const hashedPassword = 'hashedpassword123';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await PasswordUtil.hash(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('bcrypt 오류를 올바르게 전파해야 한다', async () => {
      const password = 'testpassword123';
      const error = new Error('해싱 실패');
      
      mockBcrypt.hash.mockRejectedValue(error);

      await expect(PasswordUtil.hash(password)).rejects.toThrow('해싱 실패');
    });
  });

  describe('compare', () => {
    it('올바른 비밀번호를 검증해야 한다', async () => {
      const password = 'testpassword123';
      const hashedPassword = 'hashedpassword123';
      
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await PasswordUtil.compare(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('잘못된 비밀번호를 거부해야 한다', async () => {
      const password = 'wrongpassword';
      const hashedPassword = 'hashedpassword123';
      
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await PasswordUtil.compare(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('bcrypt 오류를 올바르게 전파해야 한다', async () => {
      const password = 'testpassword123';
      const hashedPassword = 'hashedpassword123';
      const error = new Error('비교 실패');
      
      mockBcrypt.compare.mockRejectedValue(error);

      await expect(PasswordUtil.compare(password, hashedPassword)).rejects.toThrow('비교 실패');
    });
  });
});