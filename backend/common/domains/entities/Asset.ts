export class Asset {
  constructor(
    public id: number,
    public roomId: number,
    public type: string,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null
  ) {}
}