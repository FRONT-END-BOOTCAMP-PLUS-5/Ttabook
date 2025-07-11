import { RsvRepository } from "@/backend/common/domains/repositories/RsvRepository";
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