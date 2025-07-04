import { UserType } from '../types/UserType';

export class User {
  constructor(
    public id: string, // UUID
    public email: string,
    public password: string,
    public type: UserType,
    public name: string
  ) {}
}
