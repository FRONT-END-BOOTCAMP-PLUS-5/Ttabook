import { RsvRepository } from "@/app/api/domain/repository/RsvRepository";
import { DeleteUserRsvDto } from "../dto/DeleteUserRsvDto";

export class DeleteUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }

    async execute(reservationData: DeleteUserRsvDto): Promise<void> {
        return this.repository.delete(reservationData);
    }
}