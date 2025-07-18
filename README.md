# Ttabook | 따북

**공간 예약 시스템**

따북은 Next.js로 구축된 종합 공간 예약 시스템입니다. 시각적 공간 관리, 사용자 인증, 관리자 제어 기능을 제공하며, 사용자는 직관적인 캔버스 기반 인터페이스를 통해 다양한 공간의 방을 예약할 수 있습니다.

## ✨ 주요 기능

- **시각적 공간 관리**: Konva를 사용한 공간 및 방 시각화 대화형 캔버스
- **사용자 인증**: 역할 기반 액세스 제어를 갖춘 안전한 JWT 기반 인증
- **예약 시스템**: 사용자 및 관리자 인터페이스를 갖춘 완전한 예약 시스템
- **관리자 패널**: 공간, 방, 예약 관리를 위한 종합 관리자 도구
- **디자인 시스템**: Storybook 문서화를 포함한 컴포넌트 라이브러리
- **실시간 업데이트**: 효율적인 데이터 가져오기 및 캐싱을 위한 React Query
- **반응형 디자인**: CSS 모듈을 사용한 모바일 친화적 인터페이스

## 🛠 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript
- **백엔드**: 클린 아키텍처를 사용한 Next.js API 라우트
- **데이터베이스**: Supabase (PostgreSQL)
- **상태 관리**: Zustand
- **데이터 패칭**: React Query (TanStack Query)
- **캔버스**: Konva & React-Konva
- **스타일링**: CSS 모듈
- **테스팅**: Jest, React Testing Library
- **디자인 시스템**: Storybook
- **패키지 매니저**: Yarn 4

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- Yarn 4.x (`packageManager` 필드에 지정됨)
- Supabase 계정 및 프로젝트

### 환경 변수

프로젝트 루트 디렉터리에 `.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT 설정
JWT_SECRET=your_jwt_secret_minimum_32_characters

# 비밀번호 해싱
BCRYPT_ROUNDS=12

# 선택사항
NODE_ENV=development
PORT=3000
```

### 설치

1. 저장소를 클론하세요:
```bash
git clone <repository-url>
cd Ttabook
```

2. 종속성을 설치하세요:
```bash
yarn install
```

3. Supabase 데이터베이스 스키마를 설정하세요 (`docs/` 폴더의 문서 참조)

4. 개발 서버를 시작하세요:
```bash
yarn dev
```

5. [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요

## 📜 사용 가능한 스크립트

- `yarn dev` - 개발 서버 시작
- `yarn build` - 프로덕션 빌드
- `yarn start` - 프로덕션 서버 시작
- `yarn test` - 테스트 실행
- `yarn lint` - ESLint 실행
- `yarn format` - Prettier로 코드 포맷팅
- `yarn storybook` - Storybook 디자인 시스템 시작
- `yarn build-storybook` - Storybook 프로덕션 빌드

## 🏗 아키텍처

따북은 관심사의 명확한 분리를 통해 **클린 아키텍처** 원칙을 따릅니다:

### 프로젝트 구조

```
app/                    # Next.js App Router
├── (anon)/            # 공개 페이지 (메인, 마이페이지)
├── admin/             # 관리자 대시보드
├── api/               # API 라우트 (어댑터)
├── components/        # 공유 컴포넌트
└── providers/         # 컨텍스트 프로바이더

backend/               # 클린 아키텍처 비즈니스 로직
├── common/
│   ├── domains/       # 엔티티 및 인터페이스
│   └── infrastructures/ # 리포지토리 및 외부 서비스
├── auth/              # 인증 유스케이스
├── user/              # 사용자 관리
├── admin/             # 관리자 작업
└── spaces/            # 공간 관리

ds/                    # 디자인 시스템
├── components/        # 재사용 가능한 UI 컴포넌트
└── styles/           # 디자인 토큰 및 테마

tests/                 # 테스트 파일
├── api/              # API 라우트 테스트
├── backend/          # 비즈니스 로직 테스트
├── components/       # 컴포넌트 테스트
└── integration/      # 통합 테스트
```

### 아키텍처 레이어

1. **엔티티** (`backend/common/domains/entities/`): 핵심 비즈니스 객체
2. **유스케이스** (`backend/*/usecases/`): 비즈니스 로직 및 규칙
3. **리포지토리** (`backend/common/domains/repositories/`): 데이터 액세스 인터페이스
4. **인프라스트럭처** (`backend/common/infrastructures/`): 외부 서비스 구현
5. **어댑터** (`app/api/*/route.ts`): API 라우트 핸들러

## 🔐 인증

따북은 다음과 같은 안전한 인증 시스템을 사용합니다:

- **JWT 토큰**: 보안을 위해 HttpOnly 쿠키에 저장
- **역할 기반 액세스**: `user` 및 `admin` 역할
- **보호된 라우트**: 무단 액세스 시 자동 리디렉션
- **세션 관리**: 자동 토큰 갱신을 통한 지속적인 로그인

자세한 구현 가이드는 `docs/auth-developer-guide.md`를 참조하세요.

## 🎨 디자인 시스템

이 프로젝트는 Storybook으로 구축된 종합 디자인 시스템을 포함합니다:

- **아토믹 디자인**: 원자, 분자, 유기체
- **디자인 토큰**: 일관된 간격, 색상, 타이포그래피
- **컴포넌트 라이브러리**: TypeScript를 사용한 재사용 가능한 UI 컴포넌트
- **문서화**: 대화형 Storybook 스토리

디자인 시스템 시작:
```bash
yarn storybook
```

## 🧪 테스팅

따북은 포괄적인 테스팅과 함께 **테스트 주도 개발(TDD)**을 따릅니다:

### 테스팅 전략

- **단위 테스트**: 개별 컴포넌트 및 함수 테스팅
- **통합 테스트**: API 라우트 및 유스케이스 테스팅
- **E2E 테스트**: 실제 데이터를 사용한 완전한 사용자 플로우 테스팅
- **컴포넌트 테스트**: Testing Library를 사용한 React 컴포넌트 테스팅

### 테스트 커버리지

- 비즈니스 로직 (유스케이스): 100% 커버리지 필수
- API 라우트: 100% 커버리지 필수
- 컴포넌트: 중요한 경로 커버
- 통합: 전체 인증 플로우 및 주요 기능

테스트 실행:
```bash
yarn test
```

## 📊 주요 기능 심화

### 캔버스 기반 공간 관리
- 대화형 방 배치 및 편집
- 실시간 시각적 피드백
- 드래그 앤 드롭 가구 배치
- 반응형 캔버스 스케일링

### 예약 시스템
- 사용자 친화적 예약 인터페이스
- 관리자 승인 워크플로우
- 충돌 방지
- 캘린더 통합

### 관리자 대시보드
- 공간 및 방 관리
- 예약 감독
- 사용자 관리
- 시스템 분석

## 🔧 개발 가이드라인

### 코드 품질
- **ESLint**: `next/core-web-vitals` 설정
- **Prettier**: 일관된 코드 포맷팅
- **Husky**: 품질 검사를 위한 pre-commit 훅
- **TypeScript**: Strict 모드 활성화

### 네이밍 컨벤션
- 컴포넌트: PascalCase (`UserProfile.tsx`)
- 훅: `use` 접두사를 사용한 camelCase (`useUserData`)
- 파일: 컴포넌트 이름과 일치
- 폴더: 복수형 (`components/`, `usecases/`)

### Git 워크플로우
- `dev`에서 기능 브랜치 생성
- 명확한 커밋 메시지
- Pre-commit 테스팅 및 포맷팅
- 풀 리퀘스트 리뷰 필수

## 📚 문서

`docs/` 디렉터리에서 포괄적인 문서를 확인할 수 있습니다:

- `auth-developer-guide.md` - 인증 시스템 사용법
- `auth-backend-api.md` - 백엔드 API 문서
- `auth-operator-guide.md` - 운영 가이드라인
- `coding-conventions.md` - 개발 표준
- `clean-code-philosophy.md` - 코드 품질 원칙

## 🚀 배포

### 프로덕션 빌드
```bash
yarn build
yarn start
```

### 환경 고려사항
- `NODE_ENV=production` 설정
- 안전한 JWT 시크릿 설정
- 프로덕션에서 HTTPS 활성화
- 적절한 CORS 정책 설정

### Vercel 배포
이 프로젝트는 Vercel 배포에 최적화되어 있습니다:
1. 저장소를 Vercel에 연결
2. 환경 변수 설정
3. main 브랜치에 푸시하면 자동 배포

## 🤝 기여하기

1. `shared/coding_convention.md`의 코딩 컨벤션을 따르세요
2. 새로운 기능에 대한 테스트 작성 (TDD 필수)
3. 필요에 따라 문서 업데이트
4. 의미 있는 커밋 메시지 사용
5. `dev` 브랜치에 풀 리퀘스트 생성

## 📄 라이선스

이 프로젝트는 비공개 및 독점 소유입니다.

---

**개발팀**: 프론트엔드 부트캠프 플러스 5기  
**프로젝트 기간**: 2024-2025  
**기술 스택**: Next.js, TypeScript, Supabase, React Query