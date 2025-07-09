import { NextRequest, NextResponse } from 'next/server';
import { SbSpaceRepository } from '../../infrastructure/repositories/SbSpaceRepository';
import { GetSpaceUsecase } from '../application/usecases/GetSpaceUsecase';
import { createClient } from '../../infrastructure/supabase/server';
import { SbRoomRepository } from '../../infrastructure/repositories/SbRoomRepository';

export async function GET(request: NextRequest) {
  try {
<<<<<<< Updated upstream
    // Supabase 클라이언트 생성
    const supabase = await createClient();
    const spaceRepository = new SbSpaceRepository(supabase);
    const getSpaceUsecase = new GetSpaceUsecase(spaceRepository);
    const spaces = await getSpaceUsecase.execute(1);
=======
    const { searchParams } = new URL(request.url);
    const spaceId = Number(searchParams.get('spaceId'));

    const supabase = await createClient();
    const spaceRepository = new SbSpaceRepository(supabase);
    const roomRepository = new SbRoomRepository(supabase); // Assuming you have a RoomRepository similar to SpaceRepository
    const getSpaceUsecase = new GetSpaceUsecase(
      spaceRepository,
      roomRepository
    );
    const spaces = await getSpaceUsecase.execute(spaceId);
>>>>>>> Stashed changes
    return NextResponse.json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);

    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
