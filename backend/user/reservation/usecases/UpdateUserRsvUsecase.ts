import { RsvRepository } from "@/app/api/domain/repository/RsvRepository";
import { UpdateUserRsvDto } from "../dto/UpdateUserRsvDto";

export class UpdateUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }

    async execute(reservationData: UpdateUserRsvDto): Promise<void> {
        return this.repository.update(reservationData);
    }
}