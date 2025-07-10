import { RsvRepository } from "@/backend/common/domain/repository/RsvRepository";
import { DeleteUserRsvDto } from "../dtos/DeleteUserRsvDto";

export class DeleteUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }

    async execute(reservationData: DeleteUserRsvDto): Promise<void> {
        return this.repository.delete(reservationData);
    }
}