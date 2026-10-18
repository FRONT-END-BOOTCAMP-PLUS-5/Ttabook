begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
select no_plan();

create temporary table tested_tables (relation regclass);
insert into tested_tables values
  ('public.assets'), ('public.reservations'), ('public.rooms'),
  ('public.spaces'), ('public.users');

select ok(
  (select relrowsecurity from pg_class where oid = relation),
  relation::text || ': RLS 활성화'
) from tested_tables order by relation::text;

-- RLS가 적용되지 않는 TRUNCATE 등도 직접 브라우저 접근에서 차단합니다.
select ok(
  not has_table_privilege(browser_role, relation, privilege),
  relation::text || ': ' || browser_role || ' ' || privilege || ' 차단'
)
from tested_tables
cross join unnest(array['anon', 'authenticated']) as roles(browser_role)
cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN']) as privileges(privilege)
order by relation::text, browser_role, privilege;

select ok(
  not has_any_column_privilege(browser_role, relation, privilege),
  relation::text || ': ' || browser_role || ' 열 단위 ' || privilege || ' 차단'
)
from tested_tables
cross join unnest(array['anon', 'authenticated']) as roles(browser_role)
cross join unnest(array['SELECT', 'INSERT', 'UPDATE']) as privileges(privilege)
order by relation::text, browser_role, privilege;

select ok(
  has_table_privilege('service_role', relation, privilege),
  relation::text || ': 서버 ' || privilege || ' 유지'
)
from tested_tables
cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as privileges(privilege)
order by relation::text, privilege;

create temporary table tested_sequences (relation regclass);
insert into tested_sequences values
  ('public.assets_id_seq'), ('public.rooms_id_seq'), ('public.spaces_id_seq');

select ok(
  not has_sequence_privilege(browser_role, relation, privilege),
  relation::text || ': ' || browser_role || ' ' || privilege || ' 차단'
)
from tested_sequences
cross join unnest(array['anon', 'authenticated']) as roles(browser_role)
cross join unnest(array['USAGE', 'SELECT', 'UPDATE']) as privileges(privilege)
order by relation::text, browser_role, privilege;

select ok(
  has_sequence_privilege('service_role', relation, privilege),
  relation::text || ': 서버 ' || privilege || ' 유지'
)
from tested_sequences
cross join unnest(array['USAGE', 'SELECT']) as privileges(privilege)
order by relation::text, privilege;

select ok(
  (select rolbypassrls from pg_roles where rolname = 'service_role'),
  '서버 service_role의 RLS 우회 전제 유지'
);
select * from finish();
rollback;
