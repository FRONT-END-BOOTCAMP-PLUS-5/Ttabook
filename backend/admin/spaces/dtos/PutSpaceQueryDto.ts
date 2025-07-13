export class PutSpaceQueryDto {
  constructor(
    public token: string,
    public spaceId: number,
    public spaceName: string
  ) {}
}
