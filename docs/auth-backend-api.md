# 인증 시스템 백엔드 API 가이드

이 문서는 Ttabook 프로젝트의 인증 시스템 백엔드 API 사용법을 설명합니다.

## 개요

인증 시스템은 **JWT + HttpOnly 쿠키**와 **Clean Architecture**를 기반으로 구축되었으며, 자격 증명 기반 인증(이메일/비밀번호)을 제공합니다.

### 기술 스택

- **Database**: Supabase PostgreSQL
- **Authentication**: JWT (jose 라이브러리)
- **Password Hashing**: bcryptjs
- **Session Management**: HttpOnly 쿠키
- **Architecture**: Clean Architecture 패턴

## API 엔드포인트

### 1. 회원가입 (Registration)

새로운 사용자 계정을 생성합니다.

**엔드포인트:** `POST /api/signup`

**요청 헤더:**

```
Content-Type: application/json
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "password": "your-password",
  "name": "사용자 이름"
}
```

**응답 (성공 - 201):**

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "사용자 이름",
    "type": "user"
  }
}
```

**응답 (실패 - 400):**

```json
{
  "error": "이메일과 패스워드는 필수입니다"
}
```

**응답 (실패 - 409):**

```json
{
  "error": "이미 사용 중인 이메일입니다"
}
```

**사용 예시:**

```javascript
const response = await fetch('/api/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'securepassword123',
    name: '새로운 사용자',
  }),
  credentials: 'include', // 쿠키 포함
});

const data = await response.json();
```

### 2. 로그인 (Sign In)

사용자 인증을 처리합니다.

**엔드포인트:** `POST /api/signin`

**요청 헤더:**

```
Content-Type: application/json
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**응답 (성공 - 200):**

```json
{
  "success": true,
  "message": "로그인이 완료되었습니다",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "사용자 이름",
    "type": "user"
  }
}
```

**응답 (실패 - 401):**

```json
{
  "error": "이메일 또는 패스워드가 올바르지 않습니다"
}
```

**사용 예시:**

```javascript
const response = await fetch('/api/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-password',
  }),
  credentials: 'include', // 쿠키 포함
});

const data = await response.json();
```

### 3. 로그아웃

사용자 세션을 종료합니다.

**엔드포인트:** `POST /api/logout`

**요청 헤더:**

```
Cookie: accessToken=...; refreshToken=...
```

**응답 (성공 - 200):**

```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다"
}
```

**사용 예시:**

```javascript
const response = await fetch('/api/logout', {
  method: 'POST',
  credentials: 'include', // 쿠키 포함
});

const data = await response.json();
```

### 4. 현재 사용자 정보 조회

현재 로그인된 사용자의 정보를 확인합니다.

**엔드포인트:** `GET /api/me`

**요청 헤더:**

```
Cookie: accessToken=...; refreshToken=...
```

**응답 (성공 - 200):**

```json
{
  "success": true,
  "message": "사용자 정보 조회가 완료되었습니다",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "사용자 이름",
    "type": "user"
  }
}
```

**응답 (실패 - 401):**

```json
{
  "error": "인증이 필요합니다"
}
```

**사용 예시:**

```javascript
const response = await fetch('/api/me', {
  method: 'GET',
  credentials: 'include', // 쿠키 포함
});

const data = await response.json();
```

### 5. 토큰 새로고침

만료된 액세스 토큰을 새로고침합니다.

**엔드포인트:** `POST /api/refresh`

**요청 헤더:**

```
Cookie: refreshToken=...
```

**응답 (성공 - 200):**

```json
{
  "success": true,
  "message": "토큰 새로고침이 완료되었습니다",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "사용자 이름",
    "type": "user"
  }
}
```

**응답 (실패 - 401):**

```json
{
  "error": "리프레시 토큰이 유효하지 않습니다"
}
```

### 6. 이메일 중복 확인

회원가입 시 이메일 중복 여부를 확인합니다.

**엔드포인트:** `GET /api/duplicates?email={email}`

**쿼리 파라미터:**
- `email`: 확인할 이메일 주소 (URL 인코딩 필요)

**응답 (성공 - 200):**

```json
{
  "available": true,
  "message": "사용 가능한 이메일입니다"
}
```

**응답 (이메일 중복 - 200):**

```json
{
  "available": false,
  "message": "이미 사용 중인 이메일입니다"
}
```

**사용 예시:**

```javascript
const email = 'test@example.com';
const response = await fetch(`/api/duplicates?email=${encodeURIComponent(email)}`);
const data = await response.json();

if (data.available) {
  console.log('사용 가능한 이메일');
} else {
  console.log('이미 사용 중인 이메일');
}
```

## 인증 플로우

### 1. 회원가입 플로우

```
1. POST /api/signup (이메일, 패스워드, 이름)
2. 패스워드 해싱 (bcrypt)
3. 사용자 생성 (Supabase)
4. JWT 토큰 생성 (액세스 토큰 15분, 리프레시 토큰 14일)
5. HttpOnly 쿠키 설정
6. 사용자 정보 반환
```

### 2. 로그인 플로우

```
1. POST /api/signin (이메일, 패스워드)
2. 사용자 조회 (Supabase)
3. 패스워드 검증 (bcrypt)
4. JWT 토큰 생성
5. HttpOnly 쿠키 설정
6. 사용자 정보 반환
```

### 3. 인증이 필요한 API 접근

```
1. 클라이언트 요청 (HttpOnly 쿠키 자동 포함)
2. 서버에서 쿠키 추출
3. 액세스 토큰 검증
4. 사용자 정보 확인
5. API 응답 반환
```

### 4. 토큰 만료 처리

```
1. 액세스 토큰 만료 감지
2. 리프레시 토큰 검증
3. 새로운 액세스 토큰 생성
4. HttpOnly 쿠키 업데이트
5. 요청 계속 처리
```

## 오류 처리

### 일반적인 오류 상황

1. **잘못된 자격 증명 (401)**
   - 이메일 또는 패스워드 불일치
   - 처리: "이메일 또는 패스워드가 올바르지 않습니다" 메시지

2. **이메일 중복 (409)**
   - 회원가입 시 이미 존재하는 이메일
   - 처리: "이미 사용 중인 이메일입니다" 메시지

3. **토큰 만료 (401)**
   - 액세스 토큰 만료
   - 처리: 자동 토큰 새로고침 또는 재로그인 요청

4. **유효하지 않은 토큰 (401)**
   - 손상된 JWT 토큰
   - 처리: 자동 로그아웃 및 재로그인 요청

### 오류 처리 예시

```javascript
// 로그인 오류 처리
const handleSignin = async (email, password) => {
  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      // 로그인 성공
      console.log('로그인 성공:', data.user);
    } else {
      // 로그인 실패
      switch (response.status) {
        case 401:
          alert('이메일 또는 패스워드가 올바르지 않습니다');
          break;
        case 400:
          alert('입력 정보를 확인해주세요');
          break;
        default:
          alert('로그인 중 오류가 발생했습니다');
      }
    }
  } catch (error) {
    console.error('네트워크 오류:', error);
    alert('네트워크 오류가 발생했습니다');
  }
};
```

## 보안 고려사항

### 1. 패스워드 보안

- **해싱**: bcrypt 사용 (Salt rounds: 12)
- **최소 길이**: 8자 이상
- **복잡성**: 프론트엔드에서 검증

### 2. JWT 토큰 보안

- **HttpOnly 쿠키**: XSS 공격 방지
- **SameSite=Strict**: CSRF 공격 방지
- **Secure**: HTTPS에서만 전송 (프로덕션)
- **짧은 만료**: 액세스 토큰 15분

### 3. 세션 관리

- **토큰 로테이션**: 리프레시 시 새로운 토큰 발급
- **자동 만료**: 리프레시 토큰 14일 후 만료
- **강제 로그아웃**: 보안 사고 시 모든 세션 무효화

### 4. API 보안

- **입력 검증**: Zod 스키마 사용
- **에러 메시지**: 최소한의 정보만 노출
- **로깅**: 보안 이벤트 기록

## 환경 변수

### 필수 환경 변수

```env
# Supabase 연결 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 보안 설정
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
BCRYPT_ROUNDS=12

# 환경 설정
NODE_ENV=production
```

### 환경 변수 검증

시스템 시작 시 자동으로 검증됩니다:

- `JWT_SECRET`: 최소 32자 이상
- `SUPABASE_SERVICE_ROLE_KEY`: 존재 여부
- `NEXT_PUBLIC_SUPABASE_URL`: 유효한 URL 형식

## 데이터베이스 스키마

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
```

## Clean Architecture 구조

```
app/api/
├── signin/(adaptor)/route.ts       # 로그인 API 어댑터
├── signup/(adaptor)/route.ts       # 회원가입 API 어댑터
├── logout/(adaptor)/route.ts       # 로그아웃 API 어댑터
├── me/(adaptor)/route.ts           # 사용자 정보 조회 API 어댑터
├── refresh/(adaptor)/route.ts      # 토큰 새로고침 API 어댑터
└── duplicates/(adaptor)/route.ts   # 이메일 중복 확인 API 어댑터

backend/auth/
├── signin/
│   ├── dtos/                       # 데이터 전송 객체
│   └── usecases/                   # 비즈니스 로직
├── signup/
│   ├── dtos/
│   └── usecases/
├── me/
│   ├── dtos/
│   └── usecases/
└── refresh/
    ├── dtos/
    └── usecases/

backend/common/
├── domains/
│   ├── entities/                   # 도메인 엔티티
│   └── repositories/               # 리포지토리 인터페이스
└── infrastructures/
    ├── auth/                       # 인증 서비스
    └── repositories/               # 리포지토리 구현
```

## 테스트 방법

### cURL 예시

```bash
# 회원가입
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스트 사용자"
  }'

# 로그인
curl -X POST http://localhost:3000/api/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 사용자 정보 조회
curl -X GET http://localhost:3000/api/me \
  -b cookies.txt

# 로그아웃
curl -X POST http://localhost:3000/api/logout \
  -b cookies.txt
```

### Postman 설정

1. **쿠키 설정**: Settings → Cookies → Enable cookies
2. **환경 변수**: `{{baseUrl}}` = `http://localhost:3000`
3. **자동 쿠키 관리**: 로그인 후 자동으로 쿠키 저장

## 성능 최적화

### 1. 데이터베이스 최적화

- 이메일 필드 인덱싱
- 쿼리 최적화
- 연결 풀링

### 2. JWT 토큰 최적화

- 페이로드 최소화
- 적절한 만료 시간 설정
- 토큰 캐싱 (선택적)

### 3. API 응답 최적화

- 압축 활성화
- 캐싱 헤더 설정
- 에러 응답 최적화

이 가이드를 통해 Ttabook 프로젝트의 인증 시스템을 효과적으로 활용할 수 있습니다.