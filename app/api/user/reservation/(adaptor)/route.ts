import { SbRsvRepository } from '@/app/api/infrastructure/repositories/SbRsvRepository';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { GetUserRsvUsecase } from '../application/usecases/GetUserRsvUsecase';
import { PostUserRsvUsecase } from '../application/usecases/PostUserRsvUsecase';
import { PostUserRsvDto } from '../application/dto/PostUserRsvDto';
import { DeleteUserRsvUsecase } from '../application/usecases/DeleteUserRsvUsecase';
import { DeleteUserRsvDto } from '../application/dto/DeleteUserRsvDto';
import { UpdateUserRsvDto } from '../application/dto/UpdateUserRsvDto';
import { UpdateUserRsvUsecase } from '../application/usecases/UpdateUserRsvUsecase';

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

export async function POST(
    request: NextRequest
) {
    try {
        const body = await request.json();
        const { reservationData } = body;

        if(!reservationData ||
           !reservationData.userId ||
           !reservationData.spaceId ||
           !reservationData.roomId ||
           !reservationData.startTime ||
           !reservationData.endTime) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const rsvRepository = new SbRsvRepository();
        const postUserRsvUsecase = new PostUserRsvUsecase(rsvRepository);

        await postUserRsvUsecase.execute(
            new PostUserRsvDto(
                reservationData.userId,
                reservationData.spaceId,
                reservationData.roomId,
                new Date(reservationData.startTime),
                new Date(reservationData.endTime)
            )
        );
        return NextResponse.json({ message: 'success' });

    } catch (error) {
        console.error('Error saving reservation:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest
) {
    try {
        const body = await request.json();
        const { rsvId, userId, startTime, endTime } = body;

        if (!rsvId || !userId || !startTime || !endTime) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const rsvRepository = new SbRsvRepository();
        const updateUserRsvUsecase = new UpdateUserRsvUsecase(rsvRepository);

        await updateUserRsvUsecase.execute(
            new UpdateUserRsvDto(
                rsvId,
                userId,
                new Date(startTime),
                new Date(endTime)
            )
        );
        return NextResponse.json({ message: 'success' });

    } catch (error) {
        console.error('Error updating reservation:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest
) {
    try {
        const body = await request.json();
        const { rsvId, userId } = body;

        if (!rsvId || !userId) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const rsvRepository = new SbRsvRepository();
        const deleteUserRsvUsecase = new DeleteUserRsvUsecase(rsvRepository);

        await deleteUserRsvUsecase.execute(
            new DeleteUserRsvDto(
                rsvId,
                userId
            )
        );
        return NextResponse.json({ message: 'success' });

    } catch (error) {
        console.error('Error deleting reservation:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
