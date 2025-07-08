export class PostUserRsvDto {
    constructor(
        public userId: number,
        public spaceId: number,
        public roomId: number,
        public startTime: Date,
        public endTime: Date
    ) {}
}
