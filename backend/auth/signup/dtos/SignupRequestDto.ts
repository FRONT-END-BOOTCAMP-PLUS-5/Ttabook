export class SignupRequestDto {
  constructor(
    public email: string,
    public password: string,
    public name: string
  ) {}
}
