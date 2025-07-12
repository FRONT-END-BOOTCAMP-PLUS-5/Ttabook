## 0. Ground Rules

| Rule            | Detail                                                        |
| --------------- | ------------------------------------------------------------- |
| **Branching**   | One feature branch per chunk, merged via PR after tests pass. |
| **TDD**         | Every step writes tests *first* (Jest + RTL).                 |
| **Commit size** | Keep PRs ≤ 400 LOC; squash-merge.                             |
| **CI**          | Must stay green (`lint → test → build`) on Node 20.x.         |

---

## 1. High-Level Blueprint → Chunks → Steps

## ✅ 완료된 기초 작업 (Phases 0-3)

| Phase | 주요 작업 내용 | 상태 |
|-------|---------------|------|
| **Phase 0** | 프로젝트 스켈레톤 & 도구 설정 (Yarn 4, ESLint, Prettier, Jest, CI 파이프라인) | ✅ 완료 |
| **Phase 1** | 인증 핵심 유틸리티 (환경변수 검증, JWT 헬퍼, 패스워드 헬퍼) | ✅ 완료 |
| **Phase 2** | 백엔드 API 라우트 (duplicate, signup, signin, logout, refresh, me) | ✅ 완료 |
| **Phase 3** | 프론트엔드 세션 레이어 (SessionProvider, ProtectedRoute) | ✅ 완료 |

**참고**: `decodeJwt` 유틸리티만 미구현 상태이나 현재 `verifyAccessToken` 함수로 대체 가능

### Phase 4 – Integration & Hardening

| Chunk                         | Micro-Steps                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| **4-1 Integration Tests**     | 4-1-a Spin up test-container Postgres.<br>4-1-b End-to-end signup→me flow.  |
| **4-2 Secrets Rotation Docs** | 4-2-a Write runbook for rotating `JWT_SECRET`.                              |
| **4-3 Manual Smoke QA**       | 4-3-a Checklist: signup, signin, 15-min expiry, 14-day refresh, role guard. |

---

## 2. LLM Code-Generation Prompts (chronological)

> Each section below is ready to paste into an LLM like GPT-4 Code Interpreter.
> Keep running them in order; every prompt assumes previous code exists and tests pass.

## ✅ 완료된 구현 프롬프트 (Prompts 1-14)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **01-08** | 기초 설정 & 핵심 유틸리티 (Next.js, CI, JWT, 패스워드, 이메일 중복, 회원가입, 세션 프로바이더) | ✅ 완료 |
| **09-12** | 프론트엔드 & API 구현 (ProtectedRoute, 통합테스트, 클린아키텍처 리팩토링, 인증 API) | ✅ 완료 |
| **13** | 클린 아키텍처 백엔드 구조 (DTOs, UseCases for auth domains) | ✅ 완료 |
| **14** | 도메인 서비스 구현 (AuthService, CookieService + 단위 테스트) | ✅ 완료 (668b412) |

---

## 3. Clean Architecture Refactoring (계속 진행중)

```text
### prompt-15-extend-user-repository
Extend existing User repository with auth-specific methods:
- Add findByEmail(email: string) method to UserRepository interface
- Implement in SbUserRepository (Supabase implementation)
- Add comprehensive unit tests for new repository methods
Follow existing repository patterns and dependency injection.
```

## ✅ 완료된 유스케이스 구현 (Prompt 16)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **16** | 인증 유스케이스 포괄적 단위 테스트 (의존성 주입 검증) | ✅ 완료 (3b95eb7) |

**구현된 유스케이스 테스트:**
- SigninUsecase: 171개 테스트 중 성공/실패/보안 케이스 검증
- RefreshTokenUsecase: 토큰 갱신, 하위 호환성, role→type 변환
- GetCurrentUserUsecase: 사용자 정보 조회, 데이터 무결성
- LogoutUsecase: JWT stateless 특성 검증

**추가 개선사항:**
- RefreshTokenUsecase 하위 호환성: originalId 미존재 시 id 사용

## ✅ 완료된 API 리팩토링 (Prompt 17)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **17** | API 라우트 핸들러를 얇은 어댑터로 리팩토링 (signup 포함) | ✅ 완료 |

**구현된 내용:**
- Signup 유스케이스 구조 생성 (SignupRequestDto, SignupResponseDto, SignupUsecase)
- Signup 라우트를 얇은 어댑터 패턴으로 리팩토링
- 모든 179개 테스트 통과 유지
- TypeScript 컴파일 오류 수정 (IAuthService.hashPassword 메서드 추가)

---

## ✅ 완료된 긴급 수정 (Prompts 18-20)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **18-20** | 긴급 수정 (테스트 통과, 프론트엔드 호환성, JWT 마이그레이션) | ✅ 완료 (f684b82) |

**해결된 문제:** 모든 테스트 통과 (117/117), JWT 하위 호환성, 필드 매핑 확인, 마이그레이션 문서

---

## 4. Integration & Hardening

```text
### prompt-18-complete-integration-test
Complete the integration test for end-to-end auth flow:
- Implement full signup → signin → me → refresh → logout flow
- Test with actual database connections (not mocked)
- Verify cookies and status codes per specification
- Ensure clean architecture layers work together properly
```

**Always**: write failing test → implement → make tests green → commit.
