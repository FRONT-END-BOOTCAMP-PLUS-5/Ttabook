## 0. Ground Rules

| Rule            | Detail                                                        |
| --------------- | ------------------------------------------------------------- |
| **Branching**   | One feature branch per chunk, merged via PR after tests pass. |
| **TDD**         | Every step writes tests *first* (Jest + RTL).                 |
| **Commit size** | Keep PRs ≤ 400 LOC; squash-merge.                             |
| **CI**          | Must stay green (`lint → test → build`) on Node 20.x.         |

---

## 1. High-Level Blueprint → Chunks → Steps

### Phase 0 – Project Skeleton & Tooling

| Chunk                   | Micro-Steps                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0-1 Repository Init** | 0-1-a Create Git repo with `pnpm` or `yarn 4`; push initial commit.<br>0-1-b Add ESLint, Prettier, Husky hooks.<br>0-1-c Add **Jest 30** config and example test. |
| **0-2 CI Pipeline**     | 0-2-a Write GitHub Actions workflow (`lint → test → build`).<br>0-2-b Cache `node_modules` and build artefacts.<br>0-2-c Fail build on coverage < 90 %.           |

### Phase 1 – Auth Core Primitives

| Chunk                     | Micro-Steps                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1-1 Env Handling**      | 1-1-a Create `.env.example` with `JWT_SECRET`, `BCRYPT_ROUNDS`.<br>1-1-b Add runtime validator to throw if vars missing.                          |
| **1-2 JWT Helpers**       | 1-2-a Implement `signAccessToken`, `signRefreshToken` (jose).<br>1-2-b Implement `verifyAccessToken`.<br>1-2-c Unit-test expiry & claim validity. |
| **1-3 Password Helpers**  | 1-3-a Wrap `bcryptjs.hash` / `compare`.<br>1-3-b Unit-test hash/verify round-trip.                                                                |
| **1-4 decodeJwt Utility** | 1-4-a Add code (already drafted).<br>1-4-b Ensure malformed tokens throw; test passes.                                                            |

### Phase 2 – Backend API Routes

| Chunk                      | Micro-Steps                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2-1 Duplicate Endpoint** | 2-1-a `GET /api/duplicate` → Zod query validation.<br>2-1-b Unit-test 200 & 409 cases with Supabase stub.                                                       |
| **2-2 Signup**             | 2-2-a Zod body schema (email + password + name).<br>2-2-b Insert user, hash PW, auto-login (set cookies).<br>2-2-c Tests: happy path, duplicate email, weak PW. |
| **2-3 Signin**             | 2-3-a Compare password, issue cookies.<br>2-3-b Reject wrong creds (401).                                                                                       |
| **2-4 Logout**             | 2-4-a Clear both cookies, return 200 JSON message.                                                                                                              |
| **2-5 Refresh**            | 2-5-a Validate refresh token, issue new access token.<br>2-5-b Handle expired token (401).                                                                      |
| **2-6 Me**                 | 2-6-a Decode access token, return user claims.<br>2-6-b Send 401 if missing/invalid.                                                                            |

### Phase 3 – Front-End Session Layer

| Chunk                          | Micro-Steps                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3-1 SessionProvider**        | 3-1-a Build context w/ React Query (`/api/me`).<br>3-1-b Add proactive refresh timer (decode `exp – 60 s`).<br>3-1-c Retry logic 0→1→2 s then logout. |
| **3-2 ProtectedRoute**         | 3-2-a Implement component + role check.<br>3-2-b Unit-test navigation scenarios.                                                                      |
| **3-3 PostLoginRedirect Hook** | 3-3-a Auto-redirect by `next` query param.                                                                                                            |

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

```text
### prompt-01-repo-bootstrap
Create a minimal Next.js 15 TypeScript repo with:
- `yarn` (Berry v4) workspace
- ESLint + Prettier config matching Airbnb/Next
- Jest 30 setup with `jest-environment-jsdom`
Add one passing example test.
```

```text
### prompt-02-ci-workflow
Add `.github/workflows/ci.yml` that:
1. Checks out code
2. Sets up Node 20.x
3. Runs `yarn install --immutable`
4. Executes `yarn lint`, `yarn test`, `yarn build`
Fail if coverage < 90 %.
```

```text
### prompt-03-env-schema
Implement `lib/config.ts` that:
- Reads `JWT_SECRET`, `BCRYPT_ROUNDS`
- Validates presence; throws w/ helpful error
Add tests for missing vars.
```

```text
### prompt-04-jwt-helpers
Create `lib/jwt.ts` exposing:
- `signAccessToken(user)` 15 min HS256
- `signRefreshToken(user)` 14 days HS256
- `verifyAccessToken(token)`
Use `jose` + `JWT_SECRET`. Provide Jest tests for happy/expired cases.
```

```text
### prompt-05-password-utils
Add `lib/password.ts` with:
- `hashPassword(raw)`
- `verifyPassword(raw, hash)`
Using `bcryptjs` w/ rounds from env.
Include unit tests.
```

```text
### prompt-06-duplicate-endpoint
Implement `src/app/api/duplicate/route.ts` (Next.js):
- Validate `email` query via Zod
- Check Supabase `public.users`
Return 200/409 per spec + tests.
```

```text
### prompt-07-signup-endpoint
Build `src/app/api/signup/route.ts`:
- Validate body (email, pw, name)
- Hash pw, insert row, auto-login (cookies)
- Return JSON body per spec
Include unit & integration tests.
```

```text
### prompt-08-session-provider
Create `components/SessionProvider.tsx`:
- React Query fetch `/api/me`
- Proactive refresh (`exp-60s`), retry 0→1→2 s
- Expose `useSession()`
Add Jest/RTL tests (mock fetch).
```

```text
### prompt-09-protected-route ✅ COMPLETED
Add `components/ProtectedRoute.tsx`:
- Redirect unauth to `/login?next=…`
- Enforce optional `role`
Unit-test navigation.
```

```text
### prompt-10-integration-flow ✅ COMPLETED
Write end-to-end Jest test:
- Start test Postgres
- Call signup → signin → me → refresh → logout
Assert cookies & status codes per spec.
```

```text
### prompt-11-folder-structure-fix ✅ COMPLETED
Fix API folder structure to follow coding conventions:
- Move `app/api/duplicates/route.ts` to `app/api/duplicates/(adaptor)/route.ts`
- Move `app/api/signup/route.ts` to `app/api/signup/(adaptor)/route.ts`
- Update all import paths in tests accordingly
- Ensure all tests still pass after folder restructuring
Follow TDD: run tests before/after to ensure nothing breaks.
```

```text
### prompt-12-core-auth-endpoints ✅ COMPLETED
Implement missing core authentication API endpoints:
- POST /api/signin - User login with JWT token generation
- GET /api/me - Current user info from access token
- POST /api/logout - Clear authentication cookies
- POST /api/refresh - Refresh access token using refresh token
All endpoints follow TDD with comprehensive test coverage (29 tests).
All endpoints use clean architecture (adaptor) folder structure.
```

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

```text
### prompt-18-emergency-test-fix ⚠️ URGENT
Fix broken test suite caused by clean architecture refactoring:
- All auth API tests are failing due to changed import dependencies
- Update test mocks to work with new use case architecture  
- Fix response format expectations (role → type field changes)
- Update SessionProvider tests for JWT field changes (originalId)
- Ensure all tests pass before continuing development
This is blocking CI and must be fixed immediately.
```

```text
### prompt-19-frontend-compatibility-audit ⚠️ HIGH PRIORITY
Audit frontend code for compatibility with auth changes:
- Search for all code using `role` field and update to `type`
- Check SessionProvider integration with other components
- Verify existing user sessions won't break with JWT changes
- Test signup/signin/logout flows end-to-end
- Update any hardcoded field references
Critical for preventing production issues.
```

```text
### prompt-20-token-migration-strategy ⚠️ HIGH PRIORITY
Plan and implement token migration strategy:
- Analyze impact of JWT format changes on existing sessions
- Implement backward compatibility for old tokens if needed
- Create migration script or graceful degradation
- Document rollback procedure if issues arise
- Test with various token scenarios (old/new format)
Essential for smooth deployment without user disruption.
```

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
