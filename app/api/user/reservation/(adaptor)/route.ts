import { SbRsvRepository } from '@/app/api/infrastructure/repositories/SbRsvRepository';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { GetUserRsvUsecase } from '../application/usecases/GetUserRsvUsecase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const rsvRepository = new SbRsvRepository();
        const getUserRsvUsecase = new GetUserRsvUsecase(rsvRepository);
        const reservations = await getUserRsvUsecase.execute(id);

        return NextResponse.json({ data: reservations });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
        
}