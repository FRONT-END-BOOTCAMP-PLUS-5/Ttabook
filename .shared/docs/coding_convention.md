# Ttabook 프로젝트 코딩 컨벤션

이 문서는 Ttabook 프로젝트의 기술적인 코딩 표준을 정의합니다. 모든 코드는 아래 규칙을 따릅니다.

## 1. 포맷팅 (Prettier)

-   **규칙:**
    -   `semi`: `true` (세미콜론 사용)
    -   `singleQuote`: `true` (작은따옴표 사용)
    -   `tabWidth`: `2` (공백 2칸 들여쓰기)
    -   `trailingComma`: `'es5'` (ES5 호환 후행 쉼표)
-   **실행 명령어:**
    ```bash
    yarn format
    ```

## 2. 린팅 (ESLint)

-   **규칙:**
    -   `next/core-web-vitals`와 `next/typescript` 설정 기반
    -   `eslint-config-prettier`를 통해 Prettier와 충돌하는 규칙 비활성화
-   **실행 명령어:**
    ```bash
    yarn lint
    ```

## 3. 타입스크립트 (TypeScript)

-   **주요 설정:**
    -   `strict`: `true` (엄격 모드)
    -   `moduleResolution`: `'bundler'`
    -   `paths`: `'@/*'`는 `./*` (프로젝트 루트) 경로 별칭으로 사용

## 4. 명명 규칙 (Naming Convention)

### 4.1. React Hooks
- **접두사:** 모든 커스텀 훅(Custom Hook)의 이름은 `use`로 시작합니다. (React 공식 규칙)
- **작명법:** `use` 뒤에는 훅의 역할을 명확히 나타내는 동사+명사 형태를 사용합니다.
    - **좋은 예시:** `useUserData`, `useFormInput`, `useWindowWidth`
    - **나쁜 예시:** `useData`, `useMyHook`

### 4.2. 컴포넌트 (Components)

#### 파일 및 폴더 구조
- **폴더링:** 관련된 파일(컴포넌트, 스타일, 타입 등)은 하나의 폴더로 묶고, `index.tsx`를 통해 외부에 노출합니다.
  ```
  // 예시: 공용 버튼 컴포넌트
  app/components/Button/
  ├── index.tsx       // export default from './Button';
  └── Button.tsx      // 실제 Button 컴포넌트 로직
  ```
- **컴포넌트 위치:**
    - **공용 컴포넌트:** 여러 페이지에서 재사용되는 컴포넌트는 `app/components/` 아래에 위치시킵니다.
    - **페이지별 컴포넌트:** 특정 페이지에서만 사용되는 컴포넌트는 해당 페이지 폴더 내의 `components` 폴더에 위치시킵니다. (예: `app/login/components/LoginForm.tsx`)

#### 명명 규칙
- **파일명 및 함수명:** 파스칼 케이스(PascalCase)를 사용합니다. (예: `UserProfile.tsx`, `function UserProfile() {}`)
- **Props 타입:** 컴포넌트명에 `Props`를 접미사로 붙입니다. (예: `interface UserProfileProps { ... }`)

## 5. API (Backend & Frontend)

### 5.1. 백엔드: API 라우트 (Next.js)

-   **파일 규칙:** 모든 API 엔드포인트는 `app/api/` 디렉터리 내에 위치하며, 파일명은 반드시 `route.ts`여야 합니다. (참고: [Next.js Route Conventions](https://nextjs.org/docs/app/api-reference/file-conventions/route))

#### 5.1.1. 클린 아키텍처 기반 폴더 구조

프로젝트는 클린 아키텍처 원칙을 따라 다음과 같은 폴더 구조를 사용합니다:

**API 라우트 구조 (`app/api/`)**
```
app/api/
├── user/reservation/          // 실제 API 호출 URL이 됨
│   └── (adaptor)/            // 어댑터 레이어 (Next.js 라우트만 포함)
│       └── route.ts          // Next.js API 라우트 파일
└── admin/spaces/
    └── (adaptor)/
        └── route.ts
```

**백엔드 비즈니스 로직 구조 (`backend/`)**
```
backend/
├── common/                   // 공통 도메인 및 인프라
│   ├── domain/              // 도메인 레이어
│   │   ├── entities/        // 엔티티 (데이터베이스 테이블)
│   │   ├── repository/      // 레포지토리 인터페이스
│   │   └── types/           // 공통 타입 정의
│   └── infrastructure/      // 인프라 레이어
│       ├── repositories/    // 레포지토리 구현체
│       ├── supabase/        // Supabase 설정
│       ├── next-auth/       // NextAuth 설정
│       └── utils/           // 유틸리티 함수
├── user/                    // 사용자 관련 기능
│   └── reservations/        // 복수형 사용
│       ├── dtos/            // 데이터 전송 객체 (복수형)
│       └── usecases/        // 유스케이스 (복수형)
├── admin/                   // 관리자 관련 기능
│   ├── reservations/        // 복수형 사용
│   │   ├── dtos/            // 복수형 사용
│   │   └── usecases/        // 복수형 사용
│   └── spaces/              // 복수형 사용
│       ├── dtos/            // 복수형 사용
│       └── usecases/        // 복수형 사용
├── spaces/                  // 공간 관련 기능 (복수형)
│   ├── dtos/                // 복수형 사용
│   └── usecases/            // 복수형 사용
├── rooms/                   // 방 관련 기능 (복수형)
│   └── reservations/        // 복수형 사용
│       ├── dtos/            // 복수형 사용
│       └── usecases/        // 복수형 사용
└── auth/                    // 인증 관련 기능
    ├── dtos/                // 복수형 사용
    ├── signup/
    │   ├── dtos/            // 복수형 사용
    │   └── usecases/        // 복수형 사용
    ├── nextauth/
    │   ├── dtos/            // 복수형 사용
    │   └── usecases/        // 복수형 사용
    └── duplications/        // 복수형 사용
        ├── dtos/            // 복수형 사용
        └── usecases/        // 복수형 사용
```

**주요 구조 원칙:**
- **분리된 관심사**: API 라우트(`app/api/`)와 비즈니스 로직(`backend/`)을 분리
- **복수형 폴더명**: 비즈니스 도메인 폴더는 복수형 사용 (예: `spaces`, `rooms`)
- **dto/usecase 승격**: `application/` 폴더를 제거하고 `dto/`와 `usecase/` 폴더를 상위로 승격
- **공통 레이어**: `backend/common/`에 도메인과 인프라 공통 요소 집중

-   **함수 명명:** `route.ts` 파일 내에서 export 되는 함수는 반드시 HTTP 메서드 이름(대문자)을 사용해야 합니다.
    ```typescript
    // app/api/user/reservation/(adaptor)/route.ts
    import { NextResponse } from 'next/server';

    export async function GET(request: Request) {
      // ... 예약 목록 조회 로직
      return NextResponse.json({ data: ... });
    }

    export async function POST(request: Request) {
      // ... 예약 생성 로직
      return NextResponse.json({ data: ... });
    }
    ```

### 5.2. 프론트엔드: API 클라이언트 (axios & React Query)

-   **파일 위치:** 백엔드 API를 호출하는 클라이언트 함수들은 `app/services/api/` 디렉터리에 리소스별로 파일을 분리하여 관리합니다. (예: `user.ts`, `post.ts`)
-   **함수 명명:** `동사 + 리소스명` 형태로 작성합니다. (예: `getUsers`, `createUser`)
-   **함수 구조:** `axios`를 사용한 `async/await` 함수로 작성하며, `response.data`를 반환하는 데 집중합니다.
    ```typescript
    // app/services/api/user.ts
    import axios from 'axios';

    export const getUsers = async () => {
      const response = await axios.get('/api/users');
      return response.data;
    };
    ```
-   **React Query 연동:** API 클라이언트 함수는 `useQuery`, `useMutation`을 사용하는 커스텀 훅 내부에서 호출합니다. 에러 핸들링 등은 이 커스텀 훅 단계에서 처리합니다.
    ```typescript
    // app/hooks/queries/useUsersQuery.ts
    import { useQuery } from '@tanstack/react-query';
    import { getUsers } from '@/app/services/api/user';

    export const useUsersQuery = () => {
      return useQuery({ queryKey: ['users'], queryFn: getUsers });
    };
    ```

## 6. 상태 관리 (Zustand)

### 6.1. 파일 위치 및 명명 규칙
- **파일 위치:** 모든 Zustand 스토어는 `app/stores/` 디렉터리에 위치합니다.
- **파일명:** 스토어의 역할을 나타내는 이름 뒤에 `.store.ts` 접미사를 붙입니다. (예: `user.store.ts`)
- **훅 이름:** `use` 접두사와 `Store` 접미사를 붙인 파스칼 케이스를 사용합니다. (예: `useUserStore`)

### 6.2. 스토어 구조
- **State와 Actions 분리:** 가독성을 위해 스토어의 `State`와 `Actions`를 타입으로 명확히 분리하여 정의합니다.
- **Immer 사용 (권장):** 불변성 관리를 용이하게 하기 위해 `immer` 미들웨어 사용을 권장합니다. (팀 논의 후 최종 결정)

#### 구조 예시 (Immer 미사용 시)
```typescript
// app/stores/user.store.ts
import { create } from 'zustand';

// 1. State와 Actions 타입 정의
interface UserState {
  user: { id: number; name: string } | null;
  isLoading: boolean;
}

interface UserActions {
  setUser: (user: UserState['user']) => void;
  setLoading: (isLoading: boolean) => void;
}

// 2. 스토어 생성
export const useUserStore = create<UserState & UserActions>((set) => ({
  // State
  user: null,
  isLoading: false,

  // Actions
  setUser: (user) => set(() => ({ user: user })),
  setLoading: (isLoading) => set(() => ({ isLoading: isLoading })),
}));
```

## 7. 테스팅 (Jest & React Testing Library)

-   **프레임워크:** Jest, React Testing Library
-   **실행 명령어:**
    ```bash
    yarn test
    ```

## 8. 패키지 관리 (Yarn Berry)

-   **패키지 매니저:** Yarn (v4.x)
-   **주요 명령어:**
    -   `yarn add <package>`
    -   `yarn add -D <package>`
    -   `yarn install`

## 9. 커밋 메시지 (권장)

-   [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따르는 것을 권장합니다.
-   **형식:** `<type>: <description>`
-   **예시:** `feat: 사용자 인증 기능 추가`, `fix: 로그인 API 버그 수정`

## 10. 언어 및 문서화 (Language & Documentation)

### 10.1. 기본 작성 언어: 한국어

-   **원칙:** 프로젝트의 모든 주석(code comments)과 문서(README, convention docs 등)는 한국어 작성을 원칙으로 합니다.
-   **적용:** 이 규칙은 개발자가 영어로 소통하는 경우에도 동일하게 적용됩니다. Gemini는 대화 언어와 별개로, 프로젝트 산출물의 언어는 한국어로 통일해야 합니다.

-   **예외 사항:**
    -   코드 내의 변수, 함수, 클래스 등의 식별자는 영어를 사용합니다.
    -   한국어로 번역하기 어색하거나 오해의 소지가 있는 기술 용어(예: `Middleware`, `Props`, `State`)는 영문 그대로 표기할 수 있습니다.
    -   외부 라이브러리에서 발생하는 에러 메시지나 로그는 원문을 유지합니다.