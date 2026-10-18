-- 로컬 빈 DB 전용 스키마 픽스처: 관찰된 구조/권한이며 사용자 데이터는 포함하지 않습니다.

SET search_path = public, pg_catalog;

CREATE SEQUENCE public."assets_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;

CREATE SEQUENCE public."rooms_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;

CREATE SEQUENCE public."spaces_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;

CREATE TABLE public."assets" (
  "id" integer DEFAULT nextval('assets_id_seq'::regclass) NOT NULL,
  "room_id" integer NOT NULL,
  "type" character varying NOT NULL,
  "position_x" real,
  "position_y" real,
  "width" real,
  "height" real
);

CREATE TABLE public."reservations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "room_id" integer NOT NULL,
  "user_id" uuid NOT NULL,
  "start_time" timestamp with time zone NOT NULL,
  "end_time" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "edited_at" timestamp with time zone,
  "deleted_at" timestamp with time zone
);

CREATE TABLE public."rooms" (
  "id" integer DEFAULT nextval('rooms_id_seq'::regclass) NOT NULL,
  "space_id" integer NOT NULL,
  "name" character varying NOT NULL,
  "detail" text,
  "position_x" real,
  "position_y" real,
  "width" real,
  "height" real
);

CREATE TABLE public."spaces" (
  "id" integer DEFAULT nextval('spaces_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL
);

CREATE TABLE public."users" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email" character varying NOT NULL,
  "password" character varying NOT NULL,
  "name" character varying NOT NULL,
  "type" character varying DEFAULT 'user'::character varying NOT NULL
);

ALTER TABLE public."assets" ADD CONSTRAINT "assets_pkey" PRIMARY KEY (id);

ALTER TABLE public."reservations" ADD CONSTRAINT "reservations_pkey" PRIMARY KEY (id);

ALTER TABLE public."rooms" ADD CONSTRAINT "rooms_pkey" PRIMARY KEY (id);

ALTER TABLE public."spaces" ADD CONSTRAINT "spaces_pkey" PRIMARY KEY (id);

ALTER TABLE public."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY (id);

ALTER TABLE public."users" ADD CONSTRAINT "users_email_key" UNIQUE (email);

ALTER TABLE public."assets" ADD CONSTRAINT "fk_room" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE public."reservations" ADD CONSTRAINT "fk_room_reservation" FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE public."reservations" ADD CONSTRAINT "fk_user_reservation" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE public."rooms" ADD CONSTRAINT "fk_space" FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE;

CREATE INDEX idx_assets_room_id ON public.assets USING btree (room_id);

ALTER SEQUENCE public."assets_id_seq" OWNED BY public."assets"."id";

CREATE INDEX idx_reservation_user_id ON public.reservations USING btree (user_id);

CREATE INDEX idx_reservation_start_time ON public.reservations USING btree (start_time);

CREATE INDEX idx_reservation_room_id ON public.reservations USING btree (room_id);

CREATE INDEX idx_reservation_end_time ON public.reservations USING btree (end_time);

CREATE INDEX idx_rooms_space_id ON public.rooms USING btree (space_id);

ALTER SEQUENCE public."rooms_id_seq" OWNED BY public."rooms"."id";

ALTER SEQUENCE public."spaces_id_seq" OWNED BY public."spaces"."id";

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
