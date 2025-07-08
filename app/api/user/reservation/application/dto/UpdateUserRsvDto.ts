export class UpdateUserRsvDto {
    constructor(
        public rsvId: string,
        public userId: string,
        public startTime: Date,
        public endTime: Date
    ) {}
}
