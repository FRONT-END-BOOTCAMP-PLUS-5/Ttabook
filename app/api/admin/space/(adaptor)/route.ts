import { NextRequest, NextResponse } from 'next/server';
import { PostSpaceQueryDto } from '../application/dto/PostSpaceQueryDto';
import { SbSpaceRepository } from '@/app/api/infrastructure/repositories/SbSpaceRepository';
import { PostSpaceUsecase } from '../application/usecases/PostSpaceUsecase';
import { PostRoomUsecase } from '../application/usecases/PostRoomUsecase';
import { SbRoomRepository } from '@/app/api/infrastructure/repositories/SbRoomRepository';
import { PostRoomQueryDto } from '../application/dto/PostRoomQueryDto';
import { PutSpaceUsecase } from '../application/usecases/PutSpaceUsecase';
import { PutSpaceQueryDto } from '../application/dto/PutSpaceQueryDto';
import { PutRoomUsecase } from '../application/usecases/PutRoomUsecase';
import { PutRoomQueryDto } from '../application/dto/PutRoomQueryDto';
import { createClient } from '@/app/api/infrastructure/supabase/server';
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
    await postSpaceUsecase.execute(
      new PostSpaceQueryDto(token, body.spaceName)
    );
    await postRoomUsecase.execute(new PostRoomQueryDto(token, body.rooms));
    return NextResponse.json({ message: 'success' });
  } catch (error) {
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
    await putRoomUsecase.execute(new PutRoomQueryDto(token, body.rooms));
    return NextResponse.json({ message: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}
