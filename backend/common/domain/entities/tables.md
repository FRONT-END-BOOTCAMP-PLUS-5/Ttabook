CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE space (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE supply (
    id SERIAL PRIMARY KEY,
    shape VARCHAR NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL
);

CREATE TABLE room_item (
    id SERIAL PRIMARY KEY,
    supply_id INTEGER REFERENCES supply(id),
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    scale_x INTEGER NOT NULL,
    scale_y INTEGER NOT NULL
);

CREATE TABLE room (
    id SERIAL PRIMARY KEY,
    supply_id INTEGER REFERENCES supply(id),
    name VARCHAR NOT NULL,
    detail VARCHAR,
    room_item_id INTEGER REFERENCES room_item(id),
    space_id INTEGER REFERENCES space(id),
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    scale_x INTEGER NOT NULL,
    scale_y INTEGER NOT NULL
);

CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    type VARCHAR NOT NULL
);

CREATE TABLE reservation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "user"(id),
    space_id INTEGER REFERENCES space(id),
    room_id INTEGER REFERENCES room(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);
