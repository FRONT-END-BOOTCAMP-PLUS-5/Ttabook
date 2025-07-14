import { NextRequest, NextResponse } from 'next/server';
import { SbRsvRepository } from '@/backend/common/infrastructures/repositories/SbRsvRepository';
import { GetRoomRsvUsecase } from '@/backend/rooms/reservations/usecases/GetRoomRsvUsecase';
import { createClient } from '@/backend/common/infrastructures/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = Number(searchParams.get('roomId'));

    const supabase = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const getroomRsvUsecase = new GetRoomRsvUsecase(rsvRepository);
    const reservations = await getroomRsvUsecase.execute(roomId);

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching spaces:', error);

    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
