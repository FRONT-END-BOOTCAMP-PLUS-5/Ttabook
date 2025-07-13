# JWT 토큰 마이그레이션 가이드

## 개요

클린 아키텍처 리팩토링 과정에서 JWT 토큰 구조가 변경되었습니다. 기존 사용자 세션의 호환성을 보장하기 위한 마이그레이션 전략을 문서화합니다.

## 변경 사항

### 기존 토큰 구조 (Legacy)

```typescript
{
  id: number,        // 해시된 숫자 ID만 존재
  email: string,
  role: string,
  exp: number,
  iat: number
}
```

### 새로운 토큰 구조 (Current)

```typescript
{
  id: number,        // 해시된 숫자 ID (유지)
  originalId: string, // 원본 UUID 문자열 (NEW)
  email: string,
  role: string,
  exp: number,
  iat: number
}
```

## 마이그레이션 전략

### 1. 하위 호환성 보장

- `verifyAccessToken()` 및 `verifyRefreshToken()`에서 `originalId` 필드 없는 기존 토큰을 자동 처리
- 기존 토큰: `originalId = numericId.toString()` 로 변환
- 새 토큰: `originalId` 그대로 사용

### 2. 구현된 호환성 로직

```typescript
// lib/jwt.ts의 토큰 검증 함수에서
const originalId = payload.originalId as string | undefined;
const numericId = payload.id as number;

// originalId가 없으면 숫자 ID를 문자열로 변환 (기존 토큰 호환성)
const userId = originalId || numericId.toString();
```

### 3. 테스트 커버리지

- 기존 형식 토큰 처리 테스트 추가
- 새로운 형식 토큰 처리 테스트 추가
- 마이그레이션 중 데이터 무결성 검증

## 배포 전략

### 1. 점진적 배포 (권장)

1. **Phase 1**: 호환성 로직이 포함된 버전 배포
2. **Phase 2**: 새 토큰 형식으로 발급 시작
3. **Phase 3**: 기존 토큰 만료 대기 (최대 14일)

### 2. 즉시 배포 (현재 상태)

- 기존 토큰 자동 호환 처리
- 새 로그인 시 새 형식 토큰 발급
- 사용자 경험 중단 없음

## 롤백 계획

### 문제 발생 시 롤백 절차

1. `lib/jwt.ts`에서 마이그레이션 로직 제거
2. `originalId` 필드를 필수가 아닌 선택사항으로 변경
3. 기존 토큰 형식으로 복구

### 롤백 코드 예시

```typescript
// 응급 롤백용 코드
return {
  id: payload.id as number,
  originalId:
    (payload.originalId as string) || (payload.id as number).toString(),
  email: payload.email as string,
  role: payload.role as string,
  exp: payload.exp as number,
  iat: payload.iat as number,
};
```

## 모니터링 지침

### 1. 로그 모니터링

- 토큰 검증 에러 급증 확인
- SessionProvider 초기화 실패율 추적

### 2. 사용자 경험 모니터링

- 예상치 못한 로그아웃 발생률
- 세션 갱신 실패율

### 3. 메트릭 추적

- 기존 토큰 vs 새 토큰 사용 비율
- 토큰 마이그레이션 성공률

## 결론

현재 구현된 마이그레이션 전략은 기존 사용자 세션을 중단하지 않으면서 새로운 토큰 구조로 안전하게 전환할 수 있습니다. 모든 변경사항은 테스트로 검증되었으며, 필요시 빠른 롤백이 가능합니다.
