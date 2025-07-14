export class GetSpaceDto {
  id: number;
  name: string;
  room: {
    id: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    positionX?: number;
    positionY?: number;
    supplies: { width: number; height: number; shape: string }[]; // 공급 정보, 필요시 추가 필드 정의 가능
  }[];

  constructor(
    id: number,
    name: string,
    room: {
      id: number;
      name: string;
      description?: string;
      createdAt?: Date;
      updatedAt?: Date;
      width?: number;
      height?: number;
      scaleX?: number;
      scaleY?: number;
      positionX?: number;
      positionY?: number;
      supplies: { width: number; height: number; shape: string }[]; // 공급 정보, 필요시 추가 필드 정의 가능
    }[]
  ) {
    this.id = id;
    this.name = name;
    this.room = room || [];
  }
}
