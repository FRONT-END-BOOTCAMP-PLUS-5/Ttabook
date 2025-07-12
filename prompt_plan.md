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

## ✅ 완료된 구현 프롬프트 (Prompts 1-8)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **01** | Next.js 15 + TypeScript + Yarn 4 + ESLint + Prettier + Jest 30 설정 | ✅ 완료 |
| **02** | GitHub Actions CI 워크플로우 (lint→test→build, 90% 커버리지) | ✅ 완료 |
| **03** | 환경변수 검증 (`lib/config.ts`: JWT_SECRET, BCRYPT_ROUNDS) | ✅ 완료 |
| **04** | JWT 헬퍼 함수 (`lib/jwt.ts`: sign/verify Access/Refresh tokens) | ✅ 완료 |
| **05** | 패스워드 유틸리티 (`lib/password.ts`: hash/verify) | ✅ 완료 |
| **06** | 이메일 중복확인 API (`GET /api/duplicates`: Zod + Supabase) | ✅ 완료 |
| **07** | 회원가입 API (`POST /api/signup`: 검증 + 해시 + 자동로그인) | ✅ 완료 |
| **08** | 세션 프로바이더 (React Context + 자동 토큰 갱신 + useSession 훅) | ✅ 완료 |

## ✅ 완료된 작업 (Prompts 9-12)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **09** | ProtectedRoute 컴포넌트 구현 (인증/권한 체크, 리다이렉트) | ✅ 완료 |
| **10** | 통합 테스트 구현 (signup→signin→me→refresh→logout 플로우) | ✅ 완료 |
| **11** | API 폴더 구조 클린 아키텍처로 리팩토링 (adaptor 패턴) | ✅ 완료 |
| **12** | 핵심 인증 API 엔드포인트 구현 (signin/me/logout/refresh, 29개 테스트) | ✅ 완료 |

---

## ⚠️ POTENTIAL ISSUES FROM BUILD FIXES

**Priority: HIGH - Review and fix these potential problems introduced during build environment fixes:**

| Issue Category | Description | Files Affected | Risk Level |
|---------------|-------------|----------------|------------|
| **JWT Type System Changes** | Modified JWT interface to include `originalId` field and changed UUID→number conversion logic. May break existing user sessions. | `lib/jwt.ts`, `app/providers/SessionProvider.tsx` | HIGH |
| **API Response Format Changes** | Changed all auth responses from `role` to `type` field. Frontend code expecting `role` will break. | All auth DTOs, API responses | HIGH |
| **Clean Architecture Dependencies** | Routes now import heavy use case classes. May cause build issues or circular dependencies. | `/api/signin`, `/api/me`, `/api/refresh` routes | MEDIUM |
| **Test Suite Broken** | All auth tests failing due to changed import patterns and response formats. CI will be red. | `tests/api/*.test.ts` files | HIGH |
| **SessionProvider Token Compatibility** | Now accesses `originalId` field that may not exist in existing JWT tokens. | `app/providers/SessionProvider.tsx` | HIGH |

**Immediate Actions Needed:**
1. **🔍 Token Migration Plan** - Audit impact on existing user sessions
2. **🔍 Frontend Audit** - Find all code using `role` field and update to `type`
3. **🔧 Test Emergency Fix** - Update test mocks to work with clean architecture
4. **📋 Rollback Strategy** - Document how to revert JWT changes if needed

---

## 3. Clean Architecture Refactoring

**Current Status:** All core auth endpoints are implemented but violate clean architecture principles. Business logic, validation, and data access are mixed in API route handlers.

```text
### prompt-13-auth-domain-structure
Create clean architecture backend structure for auth:
- backend/auth/signin/dtos/ (SigninRequestDto, SigninResponseDto)
- backend/auth/signin/usecases/ (SigninUsecase)
- backend/auth/refresh/dtos/ (RefreshTokenRequestDto, RefreshTokenResponseDto)
- backend/auth/refresh/usecases/ (RefreshTokenUsecase)
- backend/auth/me/dtos/ (GetCurrentUserResponseDto)
- backend/auth/me/usecases/ (GetCurrentUserUsecase)
- backend/auth/logout/dtos/ (LogoutResponseDto)
- backend/auth/logout/usecases/ (LogoutUsecase)
Follow existing coding conventions and folder structure patterns.
```

```text
### prompt-14-auth-domain-services
Create domain services for auth operations:
- backend/common/infrastructures/auth/AuthService.ts (JWT operations)
- backend/common/infrastructures/auth/CookieService.ts (HTTP cookie management)
- backend/common/domains/auth/interfaces/IAuthService.ts (domain interface)
Extract common utilities from route handlers into reusable services.
Include comprehensive unit tests for all services.
```

```text
### prompt-15-extend-user-repository
Extend existing User repository with auth-specific methods:
- Add findByEmail(email: string) method to UserRepository interface
- Implement in SbUserRepository (Supabase implementation)
- Add comprehensive unit tests for new repository methods
Follow existing repository patterns and dependency injection.
```

```text
### prompt-16-implement-auth-usecases
Implement auth use cases with proper dependency injection:
- SigninUsecase: Handle authentication flow with password verification
- RefreshTokenUsecase: Token refresh logic with validation
- GetCurrentUserUsecase: Extract user info from JWT token
- LogoutUsecase: Handle logout business logic
Each use case should have comprehensive unit tests.
Follow existing use case patterns in the codebase.
```

```text
### prompt-17-refactor-api-routes
Refactor API route handlers to be thin adapters:
- Remove all business logic from route handlers
- Use dependency injection to call appropriate use cases
- Focus only on HTTP request/response handling
- Maintain exact same API contracts and response formats
- Ensure all 29 existing tests continue to pass
Follow existing API adapter patterns in the codebase.
```

---

## 🚨 URGENT FIXES NEEDED

## ✅ 완료된 긴급 수정 (Prompts 18-20)

| Prompt | 작업 내용 | 상태 |
|--------|-----------|------|
| **18** | 클린 아키텍처 리팩토링으로 인한 테스트 수정 | ✅ 완료 (이미 통과) |
| **19** | 프론트엔드 호환성 감사 (role ↔ type 필드 매핑) | ✅ 완료 (올바른 아키텍처) |
| **20** | JWT 토큰 마이그레이션 전략 구현 | ✅ 완료 (f684b82) |

**해결된 문제:**
- ✅ 모든 테스트 통과 (100/100 passing)
- ✅ JWT 토큰 하위 호환성 보장
- ✅ 프론트엔드-백엔드 필드 매핑 확인 (API: `type`, JWT/Frontend: `role`)
- ✅ 마이그레이션 문서 및 롤백 계획 작성
- ✅ 기존 사용자 세션 중단 없이 배포 가능

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
