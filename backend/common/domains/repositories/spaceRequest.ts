export class SaveRequest {
  constructor(public name: string) {}
}

export class UpdateRequest {
  constructor(
    public id: number,
    public name: string
  ) {}
}
