import { SbRsvRepository } from '@/backend/common/infrastructures/repositories/SbRsvRepository';

import { NextRequest, NextResponse } from 'next/server';
import { GetUserRsvUsecase } from '@/backend/user/reservations/usecases/GetUserRsvUsecase';
import { PostUserRsvUsecase } from '@/backend/user/reservations/usecases/PostUserRsvUsecase';
import { PostUserRsvDto } from '@/backend/user/reservations/dtos/PostUserRsvDto';
import { DeleteUserRsvUsecase } from '@/backend/user/reservations/usecases/DeleteUserRsvUsecase';
import { DeleteUserRsvDto } from '@/backend/user/reservations/dtos/DeleteUserRsvDto';
import { UpdateUserRsvDto } from '@/backend/user/reservations/dtos/UpdateUserRsvDto';
import { UpdateUserRsvUsecase } from '@/backend/user/reservations/usecases/UpdateUserRsvUsecase';
import { createClient } from '@/backend/common/infrastructures/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    console.log('userId', userId);

    const supabase: SupabaseClient = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const getUserRsvUsecase = new GetUserRsvUsecase(rsvRepository);
    const reservations = await getUserRsvUsecase.execute(userId);

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationData } = body;

    if (
      !reservationData ||
      !reservationData.userId ||
      !reservationData.roomId ||
      !reservationData.startTime ||
      !reservationData.endTime
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase: SupabaseClient = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const postUserRsvUsecase = new PostUserRsvUsecase(rsvRepository);

    await postUserRsvUsecase.execute(
      new PostUserRsvDto(
        reservationData.userId,
        reservationData.roomId,
        reservationData.startTime,
        reservationData.endTime
      )
    );
    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.error('Error saving reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationData } = body;
    console.log(reservationData);
    if (
      !reservationData ||
      !reservationData.userId ||
      !reservationData.rsvId ||
      !reservationData.startTime ||
      !reservationData.endTime
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase: SupabaseClient = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const updateUserRsvUsecase = new UpdateUserRsvUsecase(rsvRepository);

    await updateUserRsvUsecase.execute(
      new UpdateUserRsvDto(
        reservationData.rsvId,
        reservationData.userId,
        new Date(reservationData.startTime),
        new Date(reservationData.endTime)
      )
    );
    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { rsvId, userId } = body;

    if (!rsvId || !userId) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase: SupabaseClient = await createClient();
    const rsvRepository = new SbRsvRepository(supabase);
    const deleteUserRsvUsecase = new DeleteUserRsvUsecase(rsvRepository);

    await deleteUserRsvUsecase.execute(new DeleteUserRsvDto(rsvId, userId));
    return NextResponse.json({ message: 'success' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
