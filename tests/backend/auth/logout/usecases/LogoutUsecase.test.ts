import { describe, it, expect, beforeEach } from '@jest/globals';
import { LogoutUsecase } from '@/backend/auth/logout/usecases/LogoutUsecase';

describe('LogoutUsecase', () => {
  let usecase: LogoutUsecase;

  beforeEach(() => {
    usecase = new LogoutUsecase();
  });

  describe('execute', () => {
    it('로그아웃 성공 응답을 반환해야 한다', async () => {
      // When
      const result = await usecase.execute();

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toBe('로그아웃이 완료되었습니다');
    });

    it('매번 동일한 응답을 반환해야 한다', async () => {
      // When
      const result1 = await usecase.execute();
      const result2 = await usecase.execute();

      // Then
      expect(result1).toEqual(result2);
      expect(result1.success).toBe(true);
      expect(result1.message).toBe('로그아웃이 완료되었습니다');
    });

    it('인자 없이 호출 가능해야 한다', async () => {
      // When & Then
      await expect(usecase.execute()).resolves.toBeDefined();
    });

    it('비동기 메서드이지만 즉시 완료되어야 한다', async () => {
      // Given
      const startTime = Date.now();

      // When
      await usecase.execute();

      // Then
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10); // 10ms 이하
    });
  });

  describe('JWT Stateless 특성', () => {
    it('서버 측 상태 변경 없이 로그아웃을 처리해야 한다', async () => {
      // Given
      // JWT는 stateless이므로 서버에서 토큰을 무효화할 수 없음
      // 클라이언트에서 쿠키 삭제로 로그아웃 처리

      // When
      const result = await usecase.execute();

      // Then
      expect(result.success).toBe(true);
      // 실제 로그아웃은 클라이언트의 쿠키 삭제로 이루어짐
      // 이 유스케이스는 단순히 성공 응답만 반환
    });

    it('의존성 없이 동작해야 한다', () => {
      // Given & When
      // LogoutUsecase는 어떤 의존성도 주입받지 않음

      // Then
      expect(usecase).toBeDefined();
      // constructor에 의존성이 없음을 확인
    });
  });

  describe('응답 형식', () => {
    it('올바른 DTO 구조를 반환해야 한다', async () => {
      // When
      const result = await usecase.execute();

      // Then
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });

    it('항상 성공 상태를 반환해야 한다', async () => {
      // When
      const result = await usecase.execute();

      // Then
      expect(result.success).toBe(true);
      // 로그아웃은 항상 성공으로 처리 (JWT stateless 특성)
    });
  });

  describe('에러 처리', () => {
    it('예외를 발생시키지 않아야 한다', async () => {
      // When & Then
      await expect(usecase.execute()).resolves.toBeDefined();
    });

    it('여러 번 연속 호출해도 안전해야 한다', async () => {
      // When & Then
      await expect(
        Promise.all([usecase.execute(), usecase.execute(), usecase.execute()])
      ).resolves.toHaveLength(3);
    });
  });
});
