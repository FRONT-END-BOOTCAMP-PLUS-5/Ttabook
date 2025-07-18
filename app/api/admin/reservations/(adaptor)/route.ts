import { SbRsvRepository } from '@/backend/common/infrastructures/repositories/SbRsvRepository';
import { NextRequest, NextResponse } from 'next/server';
import { GetRsvListUsecase } from '@/backend/admin/reservations/usecases/GetRsvListUsecase';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { tokenValidation } from '@/utils/validation';

export async function GET(request: NextRequest) {
  if (!tokenValidation(request)) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const supabase: SupabaseClient = await createClient();

  const rsvRepository = new SbRsvRepository(supabase);

  const getRsvListUsecase = new GetRsvListUsecase(rsvRepository);
  const rsvList = await getRsvListUsecase.execute();

  return NextResponse.json(rsvList);
}
