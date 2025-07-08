export class SaveRequest {
  constructor(
    public userId: string,
    public roomId: number,
    public spaceId: number,
    public startTime: Date,
    public endTime: Date,
  ) {}
}

export class UpdateRequest {
  constructor(
    public rsvId: string,
    public userId: string,
    public startTime: Date,
    public endTime: Date,
  ) {}
}

export class DeleteRequest {
  constructor(
    public rsvId: string,
    public userId: string
  ) {}
}