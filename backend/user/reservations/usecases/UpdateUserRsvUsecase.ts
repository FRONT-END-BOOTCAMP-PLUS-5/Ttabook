import { RsvRepository } from "@/backend/common/domains/repositories/RsvRepository";
import { UpdateUserRsvDto } from "../dtos/UpdateUserRsvDto";

export class UpdateUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }

    async execute(reservationData: UpdateUserRsvDto): Promise<void> {
        return this.repository.update(reservationData);
    }
}