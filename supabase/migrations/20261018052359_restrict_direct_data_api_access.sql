-- 자체 JWT 인증은 서버에서 처리하므로 브라우저 역할에 테이블을 노출하지 않습니다.
-- RLS 전환과 권한 회수를 하나의 원자적 변경으로 적용합니다.
do $migration$
begin
  alter table public.users enable row level security;
  alter table public.spaces enable row level security;
  alter table public.rooms enable row level security;
  alter table public.reservations enable row level security;
  alter table public.assets enable row level security;

  revoke all privileges on table
    public.users, public.spaces, public.rooms, public.reservations, public.assets
  from public, anon, authenticated;

  revoke all privileges on sequence
    public.spaces_id_seq, public.rooms_id_seq, public.assets_id_seq
  from public, anon, authenticated;
end;
$migration$;
