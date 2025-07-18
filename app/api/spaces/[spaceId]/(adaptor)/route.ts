import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SbSpaceRepository } from '@/backend/common/infrastructures/repositories/SbSpaceRepository';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import { GetSpaceUsecase } from '@/backend/spaces/usecases/GetSpaceUsecase';
import { GetRoomsInSpaceUsecase } from '@/backend/spaces/usecases/GetRoomsInSpaceUsecase';
import { GetSpaceDto } from '@/backend/spaces/dtos/GetSpaceDto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    const { spaceId } = await params;
    const numericSpaceId = Number(spaceId);

    if (isNaN(numericSpaceId)) {
      return NextResponse.json({ error: 'Invalid space ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const spaceRepository = new SbSpaceRepository(supabase);
    const getSpaceUsecase = new GetSpaceUsecase(spaceRepository);
    const spaceInfo = await getSpaceUsecase.execute(numericSpaceId);

    const roomRepository = new SbRoomRepository(supabase);
    const getRoomsUsecase = new GetRoomsInSpaceUsecase(roomRepository);
    const rooms = await getRoomsUsecase.execute(numericSpaceId);

    if (!spaceInfo) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(
      new GetSpaceDto(spaceInfo.id, spaceInfo.name, rooms)
    );
  } catch (error) {
    console.error('Error fetching space:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch space: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT 핸들러는 /api/admin/spaces/[spaceId] 경로로 이전되었으므로
// 이 파일에서는 더 이상 사용되지 않을 가능성이 높습니다.
// 혼동을 피하기 위해 주석 처리합니다.
/*
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    const { spaceId } = await params;
    const numericSpaceId = Number(spaceId);

    if (isNaN(numericSpaceId)) {
      return NextResponse.json({ error: 'Invalid space ID' }, { status: 400 });
    }

    const body = await request.json();
    const { spaceName } = body;

    const supabase = await createClient();

    const { error: spaceUpdateError } = await supabase
      .from('spaces')
      .update({ name: spaceName })
      .eq('id', numericSpaceId);

    if (spaceUpdateError) {
      throw spaceUpdateError;
    }

    return NextResponse.json({ message: 'Space name updated successfully' });
  } catch (error) {
    console.error('Error updating space:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update space: ${errorMessage}` },
      { status: 500 }
    );
  }
}
*/
