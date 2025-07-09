import { NextRequest, NextResponse } from 'next/server';
import { SbRsvRepository } from '@/app/api/infrastructure/repositories/SbRsvRepository';
import { GetRoomRsvUsecase } from '../applications/usecases/GetRoomRsvUsecase';
import { createClient } from '@/app/api/infrastructure/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = Number(searchParams.get('spaceId'));
    const roomId = Number(searchParams.get('roomId'));

    const supabase = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const getroomRsvUsecase = new GetRoomRsvUsecase(rsvRepository);
    const reservations = await getroomRsvUsecase.execute(spaceId, roomId);

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching spaces:', error);

    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
