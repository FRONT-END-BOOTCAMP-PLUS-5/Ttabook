import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { UpdateSpaceUsecase } from '@/backend/admin/spaces/usecases/UpdateSpaceUsecase';
import { UpdateSpaceBody } from '@/backend/admin/spaces/dtos/UpdateSpaceDto';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { spaceId: spaceIdString } = await params;
    const spaceId = Number(spaceIdString);

    if (isNaN(spaceId)) {
      return NextResponse.json({ error: 'Invalid space ID' }, { status: 400 });
    }

    const body: UpdateSpaceBody = await request.json();

    const supabase = await createClient();
    const updateSpaceUsecase = new UpdateSpaceUsecase(supabase);

    const result = await updateSpaceUsecase.execute(spaceId, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/admin/spaces/[spaceId]:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
