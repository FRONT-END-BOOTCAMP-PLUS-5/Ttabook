export class GetRoomReservationDto {
  startTime: Date;
  endTime: Date;

  constructor(startTime: Date, endTime: Date) {
    this.startTime = startTime;
    this.endTime = endTime;
  }
}
