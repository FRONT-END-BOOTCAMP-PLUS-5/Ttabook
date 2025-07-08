export class GetSpaceDto {
  id: number;
  name: string;
  rooms: {
    id: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }[];

  constructor(
    id: number,
    name: string,
    rooms: {
      id: number;
      name: string;
      description?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }[]
  ) {
    this.id = id;
    this.name = name;
    this.rooms = rooms;
  }
}
