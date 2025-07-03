# 인증 시스템 백엔드 API 가이드

이 문서는 Ttabook 프로젝트의 인증 시스템 백엔드 API 사용법을 설명합니다.

## 개요

인증 시스템은 NextAuth.js와 Supabase를 기반으로 구축되었으며, 자격 증명 기반 인증(이메일/비밀번호)을 제공합니다.

## API 엔드포인트

### 1. 사용자 등록 (Registration)

새로운 사용자 계정을 생성합니다.

**엔드포인트:** `POST /api/auth/register`

**요청 헤더:**
```
Content-Type: application/json
```

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "your-password",
  "type": "user"  // 선택사항, 기본값: "user", 가능한 값: "user" | "admin"
}
```

**응답 (성공 - 201):**
```json
{
  "message": "사용자 등록이 완료되었습니다.",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "type": "user"
  }
}
```

**응답 (실패 - 400):**
```json
{
  "error": "이메일과 비밀번호는 필수입니다."
}
```

**응답 (실패 - 500):**
```json
{
  "error": "이미 존재하는 이메일입니다."
}
```

**사용 예시:**
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'securepassword123',
    type: 'user'
  })
});

const data = await response.json();
```

### 2. 로그인 (NextAuth 엔드포인트)

NextAuth를 통한 로그인을 처리합니다.

**엔드포인트:** `POST /api/auth/signin`

이 엔드포인트는 NextAuth가 자동으로 생성하며, 주로 NextAuth 클라이언트 라이브러리를 통해 사용됩니다.

**프론트엔드에서 사용법:**
```javascript
import { signIn } from 'next-auth/react'

// 로그인 시도
const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'your-password',
  redirect: false, // 자동 리다이렉트 방지
})

if (result?.error) {
  console.error('로그인 실패:', result.error)
} else {
  console.log('로그인 성공')
}
```

### 3. 로그아웃

**엔드포인트:** `POST /api/auth/signout`

**프론트엔드에서 사용법:**
```javascript
import { signOut } from 'next-auth/react'

// 로그아웃
await signOut({
  redirect: true, // 로그인 페이지로 리다이렉트
  callbackUrl: '/' // 리다이렉트할 URL
})
```

### 4. 세션 확인

현재 로그인된 사용자의 세션 정보를 확인합니다.

**엔드포인트:** `GET /api/auth/session`

**응답 (로그인됨):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "user@example.com",
    "type": "user"
  },
  "expires": "2024-01-31T12:00:00.000Z"
}
```

**응답 (로그인되지 않음):**
```json
{}
```

**프론트엔드에서 사용법:**
```javascript
import { getSession } from 'next-auth/react'

// 세션 확인
const session = await getSession()
if (session) {
  console.log('로그인된 사용자:', session.user)
} else {
  console.log('로그인되지 않음')
}
```

### 5. CSRF 토큰

**엔드포인트:** `GET /api/auth/csrf`

CSRF 보호를 위한 토큰을 반환합니다.

**응답:**
```json
{
  "csrfToken": "abc123..."
}
```

## NextAuth Hook 사용법

### useSession

컴포넌트에서 세션 정보에 접근할 때 사용합니다.

```javascript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>로딩 중...</p>
  
  if (status === 'unauthenticated') {
    return <p>로그인이 필요합니다.</p>
  }

  return (
    <div>
      <p>안녕하세요, {session.user.email}님!</p>
      <p>사용자 타입: {session.user.type}</p>
    </div>
  )
}
```

### 서버 사이드에서 세션 확인

```javascript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/infrastructure/next-auth/auth.config'

// API 라우트에서
export async function GET(request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response('인증되지 않음', { status: 401 })
  }
  
  // 인증된 사용자만 접근 가능한 로직
  return Response.json({ message: '성공' })
}

// 페이지에서
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }
  
  return {
    props: { session },
  }
}
```

## 인증 플로우

### 1. 회원가입 플로우
```
1. POST /api/auth/register (이메일, 비밀번호)
2. 성공 시 자동으로 로그인 페이지로 이동
3. signIn() 호출하여 로그인
```

### 2. 로그인 플로우
```
1. signIn('credentials', { email, password })
2. 백엔드에서 자격 증명 검증
3. 성공 시 JWT 토큰 생성 및 세션 설정
4. 클라이언트에 세션 정보 반환
```

### 3. 인증이 필요한 페이지 접근
```
1. useSession() 또는 getServerSession()로 세션 확인
2. 세션이 없으면 로그인 페이지로 리다이렉트
3. 세션이 있으면 페이지 렌더링
```

## 오류 처리

### 일반적인 오류 상황

1. **잘못된 자격 증명**
   - 응답: `CredentialsSignin` 오류
   - 처리: 사용자에게 "이메일 또는 비밀번호가 올바르지 않습니다" 메시지 표시

2. **이미 존재하는 이메일**
   - 응답: `500` 상태 코드와 "이미 존재하는 이메일입니다" 메시지
   - 처리: 사용자에게 다른 이메일 사용 안내

3. **세션 만료**
   - 응답: 빈 세션 객체 `{}`
   - 처리: 자동으로 로그인 페이지로 리다이렉트

### 오류 처리 예시

```javascript
// 로그인 오류 처리
const handleLogin = async (email, password) => {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      switch (result.error) {
        case 'CredentialsSignin':
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
          break
        default:
          setError('로그인 중 오류가 발생했습니다.')
      }
    } else {
      // 로그인 성공
      router.push('/dashboard')
    }
  } catch (error) {
    setError('네트워크 오류가 발생했습니다.')
  }
}
```

## 보안 고려사항

1. **비밀번호 해싱**: bcrypt를 사용하여 salt rounds 12로 해싱
2. **JWT 토큰**: NextAuth가 자동으로 JWT 토큰 관리
3. **CSRF 보호**: NextAuth가 자동으로 CSRF 토큰 처리
4. **환경 변수**: 민감한 정보는 환경 변수로 관리

## 필수 환경 변수

```env
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 데이터베이스 스키마

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  type TEXT CHECK (type IN ('user', 'admin')) DEFAULT 'user'
);
```

이 가이드를 통해 Ttabook 프로젝트의 인증 시스템을 효과적으로 활용할 수 있습니다.