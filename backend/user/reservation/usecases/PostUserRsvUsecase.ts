import { RsvRepository } from "@/app/api/domain/repository/RsvRepository";
import { PostUserRsvDto } from "../dto/PostUserRsvDto";

export class PostUserRsvUsecase {
    private repository: RsvRepository;
    constructor(repository: RsvRepository) {
        this.repository = repository;
    }

    async execute(reservationData: PostUserRsvDto): Promise<void> {
        return this.repository.save(reservationData);
    }
}