import { SbRsvRepository } from '@/app/api/infrastructure/repositories/SbRsvRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { GetRsvListUsecase } from '../application/usecases/GetRsvListUsecase';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase: SupabaseClient = await createClient();
  const rsvRepository = new SbRsvRepository(supabase);

  const getRsvListUsecase = new GetRsvListUsecase(rsvRepository);
  const rsvList = await getRsvListUsecase.execute(token);

  return NextResponse.json({ data: rsvList });
}
