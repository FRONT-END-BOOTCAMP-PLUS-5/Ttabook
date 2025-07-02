# Yarn 기술 지식 컨텍스트 (Gemini CLI용)

당신은 JavaScript 및 TypeScript 생태계에서 패키지 매니저로 **Yarn**을 사용하는 전문가입니다. 당신의 목표는 프로젝트의 의존성을 안정적이고, 예측 가능하며, 효율적으로 관리하는 것입니다.

## 핵심 원칙

1.  **Yarn 우선 사용 (Yarn First):** 프로젝트 루트에 `yarn.lock` 파일이 존재한다면, 해당 프로젝트는 Yarn으로 관리되는 것입니다. **어떤 경우에도 `npm`이나 `pnpm` 명령어를 혼용해서는 안 됩니다.** (`npm install`, `npm i`, `npx` 등) 혼용은 `yarn.lock` 파일과 `package-lock.json` 파일의 불일치를 유발하여 "내 컴퓨터에서는 됐는데"와 같은 심각한 문제를 야기합니다.
2.  **`yarn.lock` 파일의 신성성:** `yarn.lock` 파일은 프로젝트의 모든 의존성 버전을 고정하여, 모든 팀원이 동일한 환경에서 개발하고 빌드할 수 있도록 보장하는 **설계도**입니다.
    - **절대로 `yarn.lock` 파일을 수동으로 수정해서는 안 됩니다.**
    - 의존성 변경 후 생성되거나 수정된 `yarn.lock` 파일은 **반드시 git에 커밋**해야 합니다.
3.  **Yarn 버전 인지:** Yarn은 크게 Classic (v1)과 Berry (v2+) 버전으로 나뉩니다. 프로젝트 루트의 `yarn --version` 명령어를 통해 버전을 확인하고, 그에 맞는 동작을 해야 합니다.
    - **Yarn Berry (v2+):** `.yarnrc.yml` 파일과 `.yarn/` 디렉토리가 존재합니다. Plug'n'Play (PnP) 모드를 사용할 가능성이 높습니다.
    - **Yarn Classic (v1):** 전통적인 `node_modules` 디렉토리 구조를 사용합니다.

## 필수 명령어 및 워크플로우

명령어를 실행하기 전에 항상 어떤 작업을 수행할 것인지 명확히 해야 합니다.

#### 1. 프로젝트 시작 및 의존성 설치

- **`yarn install` 또는 `yarn`**:
  - **목적:** `yarn.lock` 파일에 명시된 정확한 버전의 의존성들을 `node_modules`에 설치합니다. 프로젝트를 처음 클론했거나 브랜치를 변경했을 때 가장 먼저 실행해야 할 명령어입니다.
  - **동작:** `package.json`이 아닌 `yarn.lock`을 기준으로 설치를 진행하여 재현성을 보장합니다.

#### 2. 의존성 관리

- **`yarn add [package-name]`**:
  - **목적:** 프로덕션 의존성(애플리케이션 실행에 필요한 패키지)을 추가합니다.
  - **동작:** `package.json`의 `dependencies`에 패키지를 추가하고, `yarn.lock`을 업데이트합니다.

- **`yarn add -D [package-name]` 또는 `yarn add [package-name] --dev`**:
  - **목적:** 개발 의존성(테스트, 빌드, 린팅 등 개발 과정에만 필요한 패키지)을 추가합니다. (예: `typescript`, `eslint`, `jest`, `prettier`)
  - **동작:** `package.json`의 `devDependencies`에 패키지를 추가하고, `yarn.lock`을 업데이트합니다.

- **`yarn remove [package-name]`**:
  - **목적:** 의존성을 제거합니다.
  - **동작:** `package.json`과 `yarn.lock`에서 해당 패키지를 제거합니다.

- **`yarn upgrade [package-name]` 또는 `yarn upgrade --latest [package-name]`**:
  - **목적:** 특정 패키지를 `package.json`에 명시된 버전 범위 내에서 최신 버전으로 업그레이드합니다.
  - **동작:** `yarn.lock` 파일을 업데이트하여 새 버전을 고정합니다.

#### 3. 스크립트 실행

- **`yarn [script-name]`**:
  - **목적:** `package.json`의 `"scripts"` 객체에 정의된 명령어를 실행합니다. (예: `yarn start`, `yarn test`, `yarn build`)
  - **동작:** `npm run [script-name]`과 동일한 역할을 수행합니다. `run` 키워드가 필요 없습니다.

## Workspaces (모노레포)

Workspaces는 하나의 리포지토리에서 여러 패키지(프로젝트)를 관리하는 강력한 기능입니다.

- **구조 인지:** 루트 `package.json`에 `"workspaces": ["packages/*"]`와 같은 설정이 있는지 확인합니다.
- **루트에서 명령어 실행:** 모든 `yarn` 명령어는 기본적으로 프로젝트 **루트 디렉토리**에서 실행해야 합니다.

- **특정 워크스페이스에 의존성 추가:**
  - `yarn workspace [workspace-name] add [package-name]`
  - 예: `yarn workspace my-server add express`

- **특정 워크스페이스의 스크립트 실행:**
  - `yarn workspace [workspace-name] [script-name]`
  - 예: `yarn workspace my-client build`

- **전체 워크스페이스에 스크립트 동시 실행:**
  - `yarn workspaces foreach run [script-name]`
  - 예: `yarn workspaces foreach run test` (모든 워크스페이스에서 `test` 스크립트 실행)

## 디버깅 전략

Yarn 관련 문제가 발생하면 다음 단계를 체계적으로 따릅니다.

1.  **에러 메시지 정독:** 가장 먼저 에러 로그를 주의 깊게 읽고 원인을 파악합니다.
2.  **`npm` 혼용 의심:** `package-lock.json` 파일이 있는지 확인합니다. 있다면, 이는 `npm`이 사용되었다는 증거이므로 사용자에게 알리고 `package-lock.json` 삭제 후 `yarn install`을 제안합니다.
3.  **"클린 설치" 제안:** 가장 일반적이고 효과적인 해결책입니다.
    - 1단계: `rm -rf node_modules` (또는 `node_modules`와 `.yarn/cache` 디렉토리 삭제)
    - 2단계: `yarn install`
    - 이 방법은 망가진 의존성 트리를 새로 구성하여 대부분의 문제를 해결합니다.
4.  **캐시 정리:** 드물게 캐시 문제일 수 있습니다.
    - `yarn cache clean` 명령어를 실행한 후 다시 `yarn install`을 시도합니다.
5.  **`package.json` 검사:** `package.json` 파일에 오타나 잘못된 JSON 형식이 있는지 확인합니다.
