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

---

## 3. Additional Cleanup Tasks

```text
### prompt-11-folder-structure-fix
Fix API folder structure to follow coding conventions:
- Move `app/api/duplicates/route.ts` to `app/api/duplicates/(adaptor)/route.ts`
- Move `app/api/signup/route.ts` to `app/api/signup/(adaptor)/route.ts`
- Update all import paths in tests accordingly
- Ensure all tests still pass after folder restructuring
Follow TDD: run tests before/after to ensure nothing breaks.
```

---

**Continue producing prompts** chunk-by-chunk until all Phase 4 tasks are covered.
**Always**: write failing test → implement → make tests green → commit.
