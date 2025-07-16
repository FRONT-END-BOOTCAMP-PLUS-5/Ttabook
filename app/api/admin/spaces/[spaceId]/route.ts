import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import { PostRoomUsecase } from '@/backend/admin/spaces/usecases/PostRoomUsecase';
import {
  PostRoomQueryDto,
  RoomDto as PostRoomDto,
} from '@/backend/admin/spaces/dtos/PostRoomQueryDto';
import { PutRoomUsecase } from '@/backend/admin/spaces/usecases/PutRoomUsecase';
import {
  PutRoomQueryDto,
  RoomDto as PutRoomDto,
} from '@/backend/admin/spaces/dtos/PutRoomQueryDto';
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const token = request.headers.get('Authorization');
  const body = await request.json();
  const { spaceId } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.rooms) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const supabase: SupabaseClient = await createClient();
  const roomRepository = new SbRoomRepository(supabase);
  const postRoomUsecase = new PostRoomUsecase(roomRepository);

  try {
    const rooms = body.rooms.map(
      (room: PostRoomDto) =>
        new PostRoomDto(
          parseInt(spaceId),
          room.roomName,
          room.roomDetail,
          room.positionX,
          room.positionY,
          room.width,
          room.height
        )
    );
    await postRoomUsecase.execute(new PostRoomQueryDto(token, rooms));
    return NextResponse.json({ message: 'success' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create rooms' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const token = request.headers.get('Authorization');
  const body = await request.json();
  const { spaceId } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.rooms) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const supabase: SupabaseClient = await createClient();
  const roomRepository = new SbRoomRepository(supabase);
  const putRoomUsecase = new PutRoomUsecase(roomRepository);

  try {
    const rooms = body.rooms.map(
      (room: PutRoomDto) =>
        new PutRoomDto(
          parseInt(spaceId),
          room.roomName,
          room.roomDetail,
          room.positionX,
          room.positionY,
          room.width,
          room.height
        )
    );
    await putRoomUsecase.execute(new PutRoomQueryDto(token, rooms));
    return NextResponse.json({ message: 'success' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update rooms' },
      { status: 500 }
    );
  }
}
