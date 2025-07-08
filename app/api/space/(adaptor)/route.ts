import { NextRequest, NextResponse } from 'next/server';
import { SbSpaceRepository } from '../../infrastructure/repositories/SbSpaceRepository';
import { GetSpaceUsecase } from '../../admin/space/usecases/GetSpaceUsecase';

// 관리자를 위한 공간 조회 API
export async function GET(request: NextRequest) {
  try {
    const spaceRepository = new SbSpaceRepository();
    const getSpaceUsecase = new GetSpaceUsecase(spaceRepository);
    const spaces = await getSpaceUsecase.execute(1);
    return NextResponse.json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
