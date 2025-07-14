export class Asset {
  constructor(
    public id: number,
    public roomId: number,
    public type: string,
    public positionX: number,
    public positionY: number,
    public width: number,
    public height: number
  ) {}
}
