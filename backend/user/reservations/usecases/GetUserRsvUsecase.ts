import { Rsv } from "@/backend/common/domains/entities/Rsv";
import { RsvRepository } from "@/backend/common/domains/repositories/RsvRepository";
import { GetUserRsvDto } from "../dtos/GetUserRsvDto";

export class GetUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }
    async execute(userId: string) {
        const reservations : Rsv[] | null = await this.repository.findByUserId(userId);
        
        return reservations?.map((rsv: Rsv) => {
            return new GetUserRsvDto(
                rsv.spaceId,
                rsv.space ? rsv.space.name : '',
                rsv.roomId,
                rsv.room ? rsv.room.name : '',
                rsv.startTime,
                rsv.endTime
            )
        }) || [];
    }
}