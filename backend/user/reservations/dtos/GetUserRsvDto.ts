export class GetUserRsvDto {
  constructor(
    public space_id: number,
    public space_name: string,
    public room_id: number,
    public room_name: string,
    public start_time: Date,
    public end_time: Date
  ) {}
}
