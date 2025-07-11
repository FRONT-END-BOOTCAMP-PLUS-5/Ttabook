export class Room {
  constructor(
    public id: number,
    public supplyId: number,
    public name: string,
    public detail: string | null,
    public roomItemId: number,
    public spaceId: number,
    public positionX: number,
    public positionY: number,
    public scaleX: number,
    public scaleY: number
  ) {}
}
