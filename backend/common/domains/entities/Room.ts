import { Asset } from './Asset';

export class Room {
  constructor(
    public id: number,
    public name: string,
    public detail: string | null,
    public spaceId: number,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null,

    public assets?: Asset[] | null
  ) {}
}
