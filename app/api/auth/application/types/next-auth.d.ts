import { UserType } from '../../../domain/entities/UserEntity';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    type: UserType;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      type: UserType;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    type: UserType;
  }
}