import { SupabaseClient } from '@supabase/supabase-js';
import { SbRoomRepository } from '@/backend/common/infrastructures/repositories/SbRoomRepository';
import { RoomData, UpdateSpaceBody } from '../dtos/UpdateSpaceDto';

export class UpdateSpaceUsecase {
  private roomRepository: SbRoomRepository;

  constructor(private supabase: SupabaseClient) {
    this.roomRepository = new SbRoomRepository(supabase);
  }

  async execute(spaceId: number, data: UpdateSpaceBody) {
    const { spaceName, rooms: incomingRooms } = data;

    // Supabase의 트랜잭션 기능을 사용하기 위해 rpc를 호출해야 합니다.
    // 여기서는 설명을 위해 개별 쿼리를 순차적으로 실행하지만,
    // 실제 프로덕션에서는 반드시 하나의 트랜잭션으로 묶어야 합니다.
    console.warn(
      'Warning: This operation is not transactional. Partial updates may occur on failure.'
    );

    // 1. 공간 이름 업데이트
    const { error: spaceUpdateError } = await this.supabase
      .from('spaces')
      .update({ name: spaceName })
      .eq('id', spaceId);

    if (spaceUpdateError) {
      console.error('Error updating space name:', spaceUpdateError);
      throw new Error('Failed to update space name');
    }

    // 2. 방 정보 동기화
    await this.synchronizeRooms(spaceId, incomingRooms);

    return { message: 'Space updated successfully' };
  }

  private async synchronizeRooms(spaceId: number, incomingRooms: RoomData[]) {
    const existingRooms = await this.roomRepository.findBySpaceId(spaceId);
    const existingRoomIds = new Set((existingRooms ?? []).map((r) => r.id));
    const incomingRoomIds = new Set(
      incomingRooms.filter((r) => r.roomId).map((r) => r.roomId as number)
    );

    // 분류: 생성, 수정, 삭제
    const toCreate = incomingRooms
      .filter((r) => !r.roomId)
      .map((r) => ({
        spaceId: spaceId,
        roomName: r.name ?? '이름 없음', // undefined일 경우 기본값 할당
        roomDetail: r.detail ?? '', // undefined일 경우 기본값 할당
        positionX: r.positionX,
        positionY: r.positionY,
        width: r.width,
        height: r.height,
      }));

    const toUpdate = incomingRooms
      .filter((r) => r.roomId && existingRoomIds.has(r.roomId))
      .map((r) => ({
        roomId: r.roomId!, // Non-null assertion operator 사용
        spaceId: spaceId,
        roomName: r.name ?? '이름 없음',
        roomDetail: r.detail ?? '',
        positionX: r.positionX,
        positionY: r.positionY,
        width: r.width,
        height: r.height,
      }));

    const toDeleteIds = [...existingRoomIds].filter(
      (id) => !incomingRoomIds.has(id)
    );

    // 실행
    if (toCreate.length > 0) {
      await this.roomRepository.saveAll(toCreate);
    }
    if (toUpdate.length > 0) {
      await this.roomRepository.upsert(toUpdate);
    }
    if (toDeleteIds.length > 0) {
      await this.roomRepository.deleteByIds(toDeleteIds);
    }
  }
}
