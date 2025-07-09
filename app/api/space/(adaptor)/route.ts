import { NextRequest, NextResponse } from 'next/server';
import { SbSpaceRepository } from '../../infrastructure/repositories/SbSpaceRepository';
import { GetSpaceUsecase } from '../application/usecase/GetSpaceUsecase';
import { createClient } from '../../infrastructure/supabase/server';

// 관리자를 위한 공간 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = Number(searchParams.get('spaceId'));
    
    // Supabase 클라이언트 생성
    const supabase = await createClient();
    const spaceRepository = new SbSpaceRepository(supabase);
    const getSpaceUsecase = new GetSpaceUsecase(spaceRepository);
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
