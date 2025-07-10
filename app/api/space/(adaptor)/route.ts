import { NextRequest, NextResponse } from 'next/server';
import { SbSpaceRepository } from '../../infrastructure/repositories/SbSpaceRepository';
import { GetSpaceUsecase } from '../application/usecases/GetSpaceUsecase';
import { createClient } from '../../infrastructure/supabase/server';
import { SbRoomRepository } from '../../infrastructure/repositories/SbRoomRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = Number(searchParams.get('spaceId'));

    const supabase = await createClient();
    const spaceRepository = new SbSpaceRepository(supabase);
    const roomRepository = new SbRoomRepository(supabase);
    const getSpaceUsecase = new GetSpaceUsecase(
      spaceRepository,
      roomRepository
    );
    const spaces = await getSpaceUsecase.execute(spaceId);
    return NextResponse.json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);

    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
