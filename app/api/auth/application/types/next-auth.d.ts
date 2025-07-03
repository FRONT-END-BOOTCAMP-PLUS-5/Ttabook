import NextAuth from 'next-auth';
import { UserType } from '../../domain/entities/user.entity';

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