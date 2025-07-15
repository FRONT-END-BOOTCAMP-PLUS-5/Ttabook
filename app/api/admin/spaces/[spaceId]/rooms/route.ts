import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import { PostRoomUsecase } from '@/backend/admin/spaces/usecases/PostRoomUsecase';
import { PostRoomQueryDto, RoomDto as PostRoomDto } from '@/backend/admin/spaces/dtos/PostRoomQueryDto';
import { PutRoomUsecase } from '@/backend/admin/spaces/usecases/PutRoomUsecase';
import { PutRoomQueryDto, RoomDto as PutRoomDto } from '@/backend/admin/spaces/dtos/PutRoomQueryDto';
import { DeleteRoomUsecase } from '@/backend/admin/spaces/usecases/DeleteRoomUsecase';

export async function POST(request: NextRequest, { params }: { params: { spaceId: string } }) {
  const token = request.headers.get('Authorization');
  const body = await request.json();
  const spaceId = parseInt(params.spaceId, 10);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.rooms) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase: SupabaseClient = await createClient();
  const roomRepository = new SbRoomRepository(supabase);
  const postRoomUsecase = new PostRoomUsecase(roomRepository);

  try {
    const rooms = body.rooms.map(
      (room: any) =>
        new PostRoomDto(
          spaceId,
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rooms' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { spaceId: string } }) {
  const token = request.headers.get('Authorization');
  const body = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.rooms) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase: SupabaseClient = await createClient();
  const roomRepository = new SbRoomRepository(supabase);
  const putRoomUsecase = new PutRoomUsecase(roomRepository);

  try {
    const rooms = body.rooms.map(
      (room: any) =>
        new PutRoomDto(
          room.roomId,
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update rooms' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { spaceId: string } }) {
  const token = request.headers.get('Authorization');
  const body = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.roomIds) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase: SupabaseClient = await createClient();
  const roomRepository = new SbRoomRepository(supabase);
  const deleteRoomUsecase = new DeleteRoomUsecase(roomRepository);

  try {
    await deleteRoomUsecase.execute(token, body.roomIds);
    return NextResponse.json({ message: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rooms' }, { status: 500 });
  }
}
