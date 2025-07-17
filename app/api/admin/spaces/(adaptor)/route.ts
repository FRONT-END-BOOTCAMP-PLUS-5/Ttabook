import { NextRequest, NextResponse } from 'next/server';
import { PostSpaceQueryDto } from '@/backend/admin/spaces/dtos/PostSpaceQueryDto';
import { SbSpaceRepository } from '@/backend/common/infrastructures/repositories/SbSpaceRepository';
import { PostSpaceUsecase } from '@/backend/admin/spaces/usecases/PostSpaceUsecase';
import { PostRoomUsecase } from '@/backend/admin/spaces/usecases/PostRoomUsecase';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import {
  PostRoomQueryDto,
  RoomDto,
} from '@/backend/admin/spaces/dtos/PostRoomQueryDto';
import { PutSpaceUsecase } from '@/backend/admin/spaces/usecases/PutSpaceUsecase';
import { PutSpaceQueryDto } from '@/backend/admin/spaces/dtos/PutSpaceQueryDto';
import { PutRoomUsecase } from '@/backend/admin/spaces/usecases/PutRoomUsecase';
import { PutRoomQueryDto } from '@/backend/admin/spaces/dtos/PutRoomQueryDto';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization');
  const body = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.spaceName) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const supabase: SupabaseClient = await createClient();

  const spaceRepository = new SbSpaceRepository(supabase);
  const postSpaceUsecase = new PostSpaceUsecase(spaceRepository);

  const roomRepository = new SbRoomRepository(supabase);
  const postRoomUsecase = new PostRoomUsecase(roomRepository);

  try {
    const spaceId = await postSpaceUsecase.execute(
      new PostSpaceQueryDto(token, body.spaceName)
    );
    const rooms = body.rooms.map(
      (room: {
        name: string;
        detail: string;
        positionX: number;
        positionY: number;
        width: number;
        height: number;
      }) =>
        new RoomDto(
          spaceId,
          room.name,
          room.detail,
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
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('Authorization');
  const body = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!body.spaceId) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const supabase: SupabaseClient = await createClient();

  const spaceRepository = new SbSpaceRepository(supabase);
  const putSpaceUsecase = new PutSpaceUsecase(spaceRepository);

  const roomRepository = new SbRoomRepository(supabase);
  const putRoomUsecase = new PutRoomUsecase(roomRepository);

  try {
    await putSpaceUsecase.execute(
      new PutSpaceQueryDto(token, body.spaceId, body.spaceName)
    );
    await putRoomUsecase.execute(
      new PutRoomQueryDto(token, body.spaceId, body.rooms)
    );
    return NextResponse.json({ message: 'success' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}
