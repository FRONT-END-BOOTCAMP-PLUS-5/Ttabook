# Ttabook 인증 시스템 개발자 가이드

## 개요

본 문서는 Ttabook 인증 시스템을 사용하는 프론트엔드 개발자를 위한 가이드입니다. React 컴포넌트, 훅, API 사용법, 그리고 일반적인 사용 패턴을 다룹니다.

## 빠른 시작

### 1. 프로젝트 설정

```bash
# 프로젝트 클론 후 의존성 설치
yarn install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 실제 값 입력
```

### 2. 기본 사용법

```tsx
import { SessionProvider } from '@/app/providers/SessionProvider';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </SessionProvider>
  );
}
```

## Core Components

### SessionProvider

인증 상태를 관리하는 React Context Provider입니다.

#### 설정

```tsx
// app/layout.tsx 또는 _app.tsx
import { SessionProvider } from '@/app/providers/SessionProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

#### Context 값

```typescript
interface SessionContextValue {
  user: SessionUser | null; // 현재 로그인한 사용자 정보
  isLoading: boolean; // 로딩 상태
  isAuthenticated: boolean; // 인증 여부
  refreshSession: () => Promise<void>; // 세션 상태 새로고침
  logout: () => Promise<void>;
}
```

#### 자동 기능

- **HttpOnly 쿠키**: 보안을 위해 서버에서만 접근 가능한 쿠키 사용
- **세션 복원**: 페이지 새로고침 시 서버 API를 통해 세션 복원  
- **자동 만료 처리**: 토큰 만료 시 자동 로그아웃
- **CSRF 보호**: HttpOnly 쿠키로 XSS/CSRF 공격 방지

### ProtectedRoute

인증된 사용자만 접근할 수 있는 라우트를 보호하는 컴포넌트입니다.

#### 기본 사용법

```tsx
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

// 로그인한 사용자만 접근 가능
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// 특정 역할만 접근 가능
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// 여러 역할 허용
<ProtectedRoute allowedRoles={['admin', 'moderator']}>
  <ModeratorPanel />
</ProtectedRoute>
```

#### Props

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string | string[]; // 허용할 역할 ('user', 'admin')
  fallback?: React.ReactNode; // 로딩 중 표시할 컴포넌트
}
```

#### 동작 방식

1. **미인증 사용자**: `/login?next={현재경로}`로 리다이렉트
2. **권한 없는 사용자**: `/forbidden`으로 리다이렉트
3. **로딩 중**: `fallback` 컴포넌트 표시 (기본: 스피너)

## Hooks

### useSession

인증 상태와 관련 기능에 접근하는 메인 훅입니다.

#### 사용법

```tsx
import { useSession } from '@/app/providers/SessionProvider';

function UserProfile() {
  const { user, isLoading, isAuthenticated, logout } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>안녕하세요, {user.name}님!</h1>
      <p>이메일: {user.email}</p>
      <p>역할: {user.type}</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

#### 반환값

```typescript
interface UseSessionReturn {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>; // HttpOnly 쿠키에서 세션 정보 새로고침
  logout: () => Promise<void>;
}
```

#### User 객체 구조

```typescript
// SessionProvider에서 사용하는 사용자 타입 (JWT 페이로드에서 파생)
interface SessionUser {
  id: string; // 사용자 UUID
  email: string; // 이메일 주소
  type: string; // 사용자 역할 ('user' | 'admin')
}
```

## 인증 폼 구현

### 로그인 폼

```tsx
import { useState } from 'react';
import { useSession } from '@/app/providers/SessionProvider';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { refreshSession } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. API로 로그인 요청
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // 쿠키 포함
      });

      const data = await response.json();

      if (response.ok) {
        // 2. 서버가 HttpOnly 쿠키를 설정함, 클라이언트 세션 상태 새로고침
        await refreshSession(); // SessionProvider 상태 업데이트
        router.push('/dashboard'); // 로그인 성공 시 리다이렉트
      } else {
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">패스워드</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
```

### 회원가입 폼

```tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 회원가입 성공 시 자동 로그인됨 (HttpOnly 쿠키 설정)
        // refreshSession은 이미 로그인 폼에서 호출했으므로 여기서는 생략 가능
        router.push('/dashboard');
      } else {
        setError(data.error || '회원가입에 실패했습니다');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="password">패스워드</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
        />
        <small>최소 8자 이상 입력해주세요</small>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
```

## API 직접 사용

SessionProvider를 통하지 않고 API를 직접 호출해야 하는 경우의 사용법입니다. 

**⚠️ 중요**: 로그인/회원가입 후에는 반드시 `refreshSession()`을 호출하여 클라이언트 세션 상태를 업데이트해야 합니다. HttpOnly 쿠키는 JavaScript에서 직접 읽을 수 없으므로 서버 API를 통해 세션 정보를 가져와야 합니다.

### 회원가입 API

```typescript
// POST /api/signup
interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '회원가입에 실패했습니다');
  }

  return response.json();
}
```

### 로그인 API

```typescript
// POST /api/signin
interface SigninRequest {
  email: string;
  password: string;
}

interface SigninResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

async function signin(data: SigninRequest): Promise<SigninResponse> {
  const response = await fetch('/api/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // 쿠키 포함
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '로그인에 실패했습니다');
  }

  return response.json();
}
```

### 현재 사용자 정보 조회

```typescript
// GET /api/me
interface MeResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

async function getCurrentUser(): Promise<MeResponse> {
  const response = await fetch('/api/me', {
    credentials: 'include', // 쿠키 포함
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '사용자 정보 조회에 실패했습니다');
  }

  return response.json();
}
```

### 로그아웃 API

```typescript
// POST /api/logout
async function logout(): Promise<void> {
  const response = await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '로그아웃에 실패했습니다');
  }
}
```

### 이메일 중복 확인

```typescript
// GET /api/duplicates?email={email}
interface DuplicateCheckResponse {
  available: boolean;
  message: string;
}

async function checkEmailDuplicate(email: string): Promise<boolean> {
  const response = await fetch(
    `/api/duplicates?email=${encodeURIComponent(email)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '이메일 확인에 실패했습니다');
  }

  const data: DuplicateCheckResponse = await response.json();
  return !data.available; // available이 false면 중복(true 반환)
}

// 사용 예시
function EmailInput() {
  const [email, setEmail] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleEmailCheck = async () => {
    if (!email) return;

    setIsChecking(true);
    try {
      const isDuplicateResult = await checkEmailDuplicate(email);
      setIsDuplicate(isDuplicateResult);
    } catch (error) {
      console.error('이메일 확인 실패:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력하세요"
      />
      <button onClick={handleEmailCheck} disabled={isChecking}>
        {isChecking ? '확인 중...' : '중복 확인'}
      </button>
      {isDuplicate && <span className="error">이미 사용 중인 이메일입니다</span>}
    </div>
  );
}
```

## 고급 사용 패턴

### 조건부 렌더링

```tsx
function Navigation() {
  const { user, isAuthenticated, logout } = useSession();

  return (
    <nav>
      <Link href="/">홈</Link>

      {isAuthenticated ? (
        // 로그인 상태
        <>
          <Link href="/dashboard">대시보드</Link>
          {user?.type === 'admin' && <Link href="/admin">관리자</Link>}
          <span>안녕하세요, {user?.name}님</span>
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        // 비로그인 상태
        <>
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
        </>
      )}
    </nav>
  );
}
```

### 역할 기반 컴포넌트

```tsx
interface RoleBasedProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

function RoleBased({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedProps) {
  const { user, isAuthenticated } = useSession();

  if (!isAuthenticated || !user) {
    return fallback;
  }

  if (!allowedRoles.includes(user.type)) {
    return fallback;
  }

  return <>{children}</>;
}

// 사용 예시
function AdminSection() {
  return (
    <RoleBased
      allowedRoles={['admin']}
      fallback={<div>관리자만 접근 가능합니다</div>}
    >
      <AdminPanel />
    </RoleBased>
  );
}
```

### 커스텀 훅 만들기

```tsx
// useAuth: 더 간단한 인터페이스 제공
function useAuth() {
  const { user, isAuthenticated } = useSession();

  return {
    user,
    isLoggedIn: isAuthenticated,
    isAdmin: user?.type === 'admin',
    isUser: user?.type === 'user',
  };
}

// useRequireAuth: 인증이 필요한 컴포넌트에서 사용
function useRequireAuth() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

// 사용 예시
function ProfilePage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user } = useSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // 리다이렉트 처리됨

  return <div>프로필: {user?.name}</div>;
}
```

## 에러 처리

### API 에러 처리

```tsx
function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const { refreshSession } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. API로 로그인 요청
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        // 2. 성공 시 세션 상태 새로고침
        await refreshSession();
      } else {
        const data = await response.json();
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인 중 오류가 발생했습니다');
        console.error('Login error:', err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드들 */}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button type="submit">로그인</button>
    </form>
  );
}
```

### 네트워크 에러 처리

```tsx
function useApiCall() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (url: string, options?: RequestInit) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (err instanceof TypeError) {
        // 네트워크 에러
        setError('네트워크 연결을 확인해주세요');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { apiCall, isLoading, error };
}
```

## 테스팅

### 컴포넌트 테스트

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from '@/app/providers/SessionProvider';
import LoginForm from './LoginForm';

// Mock SessionProvider
const MockSessionProvider = ({ children, value }: any) => (
  <SessionProvider.Provider value={value}>{children}</SessionProvider.Provider>
);

describe('LoginForm', () => {
  it('로그인 성공 시 refreshSession 함수가 호출된다', async () => {
    const mockRefreshSession = jest.fn().mockResolvedValue(undefined);
    const sessionValue = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      refreshSession: mockRefreshSession,
      logout: jest.fn(),
    };

    render(
      <MockSessionProvider value={sessionValue}>
        <LoginForm />
      </MockSessionProvider>
    );

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/패스워드/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefreshSession).toHaveBeenCalled();
    });
  });

  it('에러 메시지가 표시된다', async () => {
    const mockRefreshSession = jest.fn().mockRejectedValue(new Error('로그인 실패'));
    const sessionValue = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      refreshSession: mockRefreshSession,
      logout: jest.fn(),
    };

    render(
      <MockSessionProvider value={sessionValue}>
        <LoginForm />
      </MockSessionProvider>
    );

    const submitButton = screen.getByRole('button', { name: /로그인/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('로그인 실패')).toBeInTheDocument();
    });
  });
});
```

### API 테스트

```tsx
import { jest } from '@jest/globals';

// fetch mock 설정
global.fetch = jest.fn();

describe('Auth API', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('회원가입 API가 성공적으로 호출된다', async () => {
    const mockResponse = {
      success: true,
      message: '회원가입이 완료되었습니다',
      user: {
        id: '1',
        email: 'test@example.com',
        name: '테스트',
        type: 'user',
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await signup({
      email: 'test@example.com',
      password: 'password123',
      name: '테스트',
    });

    expect(fetch).toHaveBeenCalledWith('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      }),
    });

    expect(result).toEqual(mockResponse);
  });
});
```

## 보안 고려사항

### 민감한 정보 처리

```tsx
// ❌ 잘못된 예시 - 패스워드를 state에 저장
function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '', // 패스워드를 일반 state에 저장
  });

  // 패스워드가 다른 state 업데이트로 인해 재렌더링됨
}

// ✅ 올바른 예시 - 패스워드를 별도 관리
function LoginForm() {
  const [email, setEmail] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = passwordRef.current?.value || '';

    try {
      await login(email, password);
      // 성공 후 패스워드 필드 클리어
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }
    } catch (error) {
      // 에러 시에도 패스워드 필드 클리어
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        ref={passwordRef}
        type="password"
        autoComplete="current-password"
      />
      <button type="submit">로그인</button>
    </form>
  );
}
```

### CSRF 방지

```tsx
// 모든 API 호출 시 credentials 포함
const apiCall = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // 쿠키 포함 (중요!)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

### XSS 방지

```tsx
// ❌ 잘못된 예시 - HTML 직접 삽입
function UserProfile({ user }: { user: User }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: `안녕하세요, ${user.name}님!` }} />
  );
}

// ✅ 올바른 예시 - React의 자동 이스케이핑 활용
function UserProfile({ user }: { user: User }) {
  return <div>안녕하세요, {user.name}님!</div>;
}
```

## 일반적인 문제 해결

### 세션이 유지되지 않는 경우

```tsx
// 원인 1: SessionProvider가 최상위에 위치하지 않음
// 해결: _app.tsx나 layout.tsx에서 SessionProvider로 전체 앱을 감싸기

// 원인 2: 쿠키 설정 문제
// 해결: 브라우저 개발자 도구에서 쿠키 확인
// - HttpOnly: true
// - SameSite: strict
// - Secure: production에서만 true

// 원인 3: 로컬 개발 환경에서 HTTPS 문제
// 해결: 로컬에서는 Secure=false 설정 확인
```

### 토큰 만료 처리

```tsx
function useTokenRefresh() {
  const { logout } = useSession();

  useEffect(() => {
    const handleResponse = (response: Response) => {
      if (response.status === 401) {
        // 토큰 만료 시 자동 로그아웃
        logout();
      }
    };

    // 글로벌 fetch 인터셉터 (선택적)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      handleResponse(response);
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);
}
```

### 로딩 상태 처리

```tsx
function App() {
  const { isLoading } = useSession();

  // 세션 로딩 중에는 스플래시 화면 표시
  if (isLoading) {
    return (
      <div className="splash-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return <MainApp />;
}
```

## TypeScript 타입 정의

### 전체 타입 정의

```typescript
// types/auth.ts
export interface SessionUser {
  id: string;
  email: string;
  type: string; // 'user' | 'admin'
}

export interface SessionContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>; // HttpOnly 쿠키에서 세션 상태 새로고침
  logout: () => Promise<void>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthApiError {
  error: string;
}

// API 요청/응답 타입
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse extends ApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse extends ApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

export interface MeResponse extends ApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}
```

### 제네릭 API 훅

```typescript
function useApi<TRequest, TResponse>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: TRequest
  ): Promise<TResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData: AuthApiError = await response.json();
        throw new Error(errorData.error);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { request, isLoading, error };
}

// 사용 예시
function useSignup() {
  const { request, isLoading, error } = useApi<SignupRequest, SignupResponse>();

  const signup = (data: SignupRequest) => request('/api/signup', 'POST', data);

  return { signup, isLoading, error };
}
```

## 성능 최적화

### 메모이제이션

```tsx
import { memo, useMemo } from 'react';

// 사용자 정보 컴포넌트 메모이제이션
const UserProfile = memo(({ user }: { user: User }) => {
  const displayName = useMemo(() => {
    return user.name.length > 20 ? `${user.name.slice(0, 20)}...` : user.name;
  }, [user.name]);

  return (
    <div>
      <h2>{displayName}</h2>
      <p>{user.email}</p>
    </div>
  );
});

// ProtectedRoute 최적화
const OptimizedProtectedRoute = memo(
  ({ children, type }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useSession();

    const hasAccess = useMemo(() => {
      if (!isAuthenticated || !user) return false;
      if (!type) return true;

      const roles = Array.isArray(type) ? type : [type];
      return roles.includes(user.type);
    }, [isAuthenticated, user, type]);

    if (isLoading) return <LoadingSpinner />;
    if (!hasAccess) return <AccessDenied />;

    return <>{children}</>;
  }
);
```

### 지연 로딩

```tsx
import { lazy, Suspense } from 'react';

// 관리자 패널 지연 로딩
const AdminPanel = lazy(() => import('./AdminPanel'));

function Dashboard() {
  const { user } = useSession();

  return (
    <div>
      <h1>대시보드</h1>

      {user?.type === 'admin' && (
        <Suspense fallback={<div>관리자 패널 로딩 중...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 마이그레이션 가이드

기존 프로젝트에 Ttabook 인증 시스템을 추가하는 경우:

### 1. 의존성 설치

```bash
yarn add @supabase/supabase-js zod jose bcryptjs
yarn add -D @types/bcryptjs
```

**참고**: 이전 버전에서 `js-cookie`를 사용했다면 제거하세요. HttpOnly 쿠키 사용으로 더 이상 필요하지 않습니다:

```bash
yarn remove js-cookie @types/js-cookie
```

### 2. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_minimum_32_characters
BCRYPT_ROUNDS=12
```

### 3. 컴포넌트 교체

```tsx
// 기존 인증 로직을 SessionProvider로 교체
// 기존 라우트 가드를 ProtectedRoute로 교체
// 기존 사용자 상태 관리를 useSession으로 교체
```

### 4. 데이터베이스 마이그레이션

기존 사용자 데이터가 있는 경우 Supabase 스키마에 맞게 데이터를 마이그레이션해야 합니다.

---

_본 가이드는 Ttabook 인증 시스템의 효과적인 사용을 위한 종합적인 가이드입니다. 추가 질문이나 문제가 있으면 개발팀에 문의해주세요._
