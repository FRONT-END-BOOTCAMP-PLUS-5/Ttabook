export class SaveRequest {
  constructor(
    public userId: number,
    public roomId: number,
    public spaceId: number,
    public startTime: Date,
    public endTime: Date,
  ) {}
}

export class UpdateRequest {
  constructor(
    public rsvId: number,
    public userId: number,
    public startTime: Date,
    public endTime: Date,
  ) {}
}

export class DeleteRequest {
  constructor(
    public rsvId: number,
    public userId: string
  ) {}
}