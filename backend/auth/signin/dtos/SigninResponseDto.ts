export class SigninResponseDto {
  constructor(
    public success: boolean,
    public message: string,
    public user: {
      id: string;
      email: string;
      name: string;
      type: string;
    }
  ) {}
}
