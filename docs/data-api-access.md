# 서버 전용 Data API 권한

Ttabook은 자체 JWT 쿠키를 사용하며, Next.js 서버가 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`로 데이터에 접근합니다. 앱 JWT는 Supabase Auth의 `authenticated` 역할이 아닙니다. 현재 브라우저에서 Supabase 테이블에 직접 접근하는 호출부는 없습니다.

## 변경 범위

`supabase/migrations/*_restrict_direct_data_api_access.sql`은 하나의 원자적 블록에서 다음을 적용합니다.

- `users`, `spaces`, `rooms`, `reservations`, `assets`에 RLS를 활성화합니다.
- 이 테이블과 `spaces_id_seq`, `rooms_id_seq`, `assets_id_seq`에서 `PUBLIC`, `anon`, `authenticated`의 권한을 회수합니다.
- 기존 `service_role`의 권한과 RLS 우회 동작은 유지합니다.

직접 브라우저 접근을 허용하는 정책은 만들지 않습니다. 다른 스키마, 역할 속성, 전역 기본 권한, 앱 API 계약은 바꾸지 않습니다. 새 테이블은 별도로 RLS와 최소 권한을 검토해야 합니다. Service-role 요청은 RLS를 우회하므로 서버 API의 서명 검증·관리자/소유자 확인은 여전히 별도로 필요합니다.

## 로컬 회귀 테스트

PostgreSQL 17 이상, Node 22 / Yarn 4.9.2와 Supabase CLI, 실행 중인 **폐기 가능한 로컬 Supabase**가 필요합니다. API/DB 포트가 실제로 loopback에만 공개됐는지 확인합니다. `PGHOST=127.0.0.1`, 해당 로컬 `PGPORT`, `PGUSER=postgres`, `PGDATABASE=postgres`와 로컬 인증 파일을 명시합니다. 원격 주소나 운영 자격 증명을 사용하지 않습니다.

`supabase/tests/fixtures/schema.sql`은 관찰된 테이블 구조와 변경 전 권한을 재현하는 테스트 전용 파일입니다. 사용자 데이터, 운영 스키마의 완전한 백업, 신규 운영 DB용 기준 마이그레이션이 아닙니다. **빈 로컬 DB에만** 적용합니다.

저장소 루트에서 다음 순서로 실행합니다. `LOCAL_SUPABASE_DIR`은 로컬 CLI 설정 디렉터리이고 `LOCAL_NETWORK`는 실제로 사용한 Docker 네트워크 이름입니다.

```sh
psql -X -v ON_ERROR_STOP=1 --single-transaction \
  -f supabase/tests/fixtures/schema.sql

# 변경 전에는 RLS/브라우저 권한 검사 실패가 발생해야 합니다.
supabase test db --local --workdir "$LOCAL_SUPABASE_DIR" \
  --network-id "$LOCAL_NETWORK" \
  "$PWD/supabase/tests/database/data_api_access_test.sql"

psql -X -v ON_ERROR_STOP=1 \
  -f supabase/migrations/*_restrict_direct_data_api_access.sql

supabase test db --local --workdir "$LOCAL_SUPABASE_DIR" \
  --network-id "$LOCAL_NETWORK" \
  "$PWD/supabase/tests/database/data_api_access_test.sql"
```

변경 후에는 160개 DB 검사가 통과해야 합니다. 테이블·열·시퀀스의 유효 권한, RLS 활성화, 서버 CRUD 및 시퀀스 권한을 확인하며 테스트 변경은 롤백됩니다. 실제 HTTP 검증에서도 두 브라우저 역할의 SELECT/INSERT/UPDATE/DELETE는 `42501`과 401/403으로 거부되고, service-role CRUD와 앱 가입/로그인/현재 사용자/갱신/로그아웃은 정상이어야 합니다. 기존 단위 테스트의 dummy Supabase 설정은 실제 DB 검증을 대신하지 않습니다.

## 적용 전후 확인

1. 대상 프로젝트의 용도와 스키마를 확인하고, 기존 ACL/RLS/정책/마이그레이션 메타데이터를 보관합니다. 별도 열 권한이나 추가 상속 역할이 있으면 그대로 적용하지 말고 먼저 검토합니다.
2. 로컬 회귀 및 앱 검사, SQL 내용 리뷰 후 동일한 SQL을 승인된 대상에 적용합니다. 신규 DB에 테스트 픽스처를 운영 마이그레이션처럼 배포하지 않습니다.
3. 실제 적용 도구가 부여한 버전과 저장소 파일명을 일치시켜 마이그레이션 이력을 유지합니다. MCP로 적용했다면 `list_migrations`에서 버전을 확인합니다.
4. RLS, 세 역할의 유효 권한, 스키마/제약 조건 보존 여부와 보안 Advisor를 다시 확인합니다. 검증 목적으로 원격 사용자 행을 조회하거나 테스트 사용자를 만들지 않습니다.

자동 롤백은 제공하지 않습니다. 이 변경에는 데이터 삭제가 없으며 반복 적용할 수 있지만, 원래 권한을 복구하면 직접 Data API 노출도 다시 열립니다. 장애가 발생하면 먼저 서버의 service-role 설정을 확인합니다. 복구가 정말 필요하면 보관한 ACL/RLS에 근거한 별도 변경을 리뷰·승인한 후 적용하고 재검증합니다. 브라우저 역할에 전체 권한을 임의로 다시 주지 않습니다.

## 2026-10-18 검증 기록

- 변경 전 실제 로컬 DB 검사 150개 중 123개가 실패했습니다. `MAINTAIN` 검사를 추가한 최종 160개는 모두 통과했고, 의도적으로 재부여한 두 `MAINTAIN` 권한도 실패로 검출한 뒤 마이그레이션을 재적용했습니다.
- 실제 로컬 Data API에서 `anon` 및 Supabase Auth로 발급받은 `authenticated` 세션의 CRUD 요청 40개가 거부됐고, 서버 CRUD는 다섯 테이블에서 유지됐습니다.
- production build로 시작한 로컬 앱의 인증 HTTP 검사 11개와 저장된 사용자 UUID·기본 역할·bcrypt cost 12 검사가 통과했습니다. HTTPS 브라우저 쿠키 동작이나 서버 API 전체의 인가 안전성을 검증한 것은 아닙니다.
- 기존 앱 검사: 20개 suite, 186개 test 통과/1개 skip, coverage·lint·build 통과. 기존 VM Modules/punycode 및 metadataBase 경고, 의도된 오류 응답 테스트의 로그는 남아 있습니다.
- 확인된 개발 대상에 `20261018052359_restrict_direct_data_api_access`를 적용하고, 권한/RLS/이력 및 구조 메타데이터를 재검증했습니다. 원격 사용자 행 조회·생성·수정은 하지 않았습니다. 호스팅된 앱의 런타임 검증은 별도입니다.

직접 브라우저 권한과 정책이 없는 서버 전용 설계이므로 보안 Advisor의 `RLS enabled without policies` 정보 알림은 의도된 상태입니다. 알림을 없애려고 허용 정책을 추가하지 않습니다. PostgreSQL 버전 경고는 별도 업그레이드 작업으로 남습니다.

## 참고

- [Supabase API 권한과 RLS](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase DB 테스트](https://supabase.com/docs/guides/database/testing)
- 구현: `backend/common/infrastructures/supabase/server.ts`, `lib/jwt.ts`
