export class EmailCheckResponse {
  constructor(
    public email: string,
    public available: boolean,
    public message: string
  ) {}
}

export class EmailCheckErrorResponse {
  constructor(public error: string) {}
}