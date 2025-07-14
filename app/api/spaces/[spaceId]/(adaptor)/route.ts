import { NextRequest, NextResponse } from 'next/server';
import { SbSpaceRepository } from '@/backend/common/infrastructures/repositories/SbSpaceRepository';
import { GetSpaceUsecase } from '@/backend/spaces/usecases/GetSpaceUsecase';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import { GetRoomsInSpaceUsecase } from '@/backend/spaces/usecases/GetRoomsInSpaceUsecase';
import { GetSpaceDto } from '@/backend/spaces/dtos/GetSpaceDto';

// 관리자, 일반사용자를 위한 공간 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params;
  try {
    const supabase = await createClient();

    // spaceId로 spaces 테이블에서 space 정보 가져오기
    const spaceRepository = new SbSpaceRepository(supabase);
    const getSpaceUsecase = new GetSpaceUsecase(spaceRepository);
    const spaceInfo = await getSpaceUsecase.execute(Number(spaceId));

    // spaceId가 같은 room들을 rooms 테이블에서 가져오기
    const roomRepository = new SbRoomRepository(supabase);
    const getRoomsRepository = new GetRoomsInSpaceUsecase(roomRepository);
    const rooms = await getRoomsRepository.execute(Number(spaceId));

    return NextResponse.json({
      data: new GetSpaceDto(spaceInfo.id, spaceInfo.name, rooms),
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
