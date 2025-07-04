export type UserType = 'user' | 'admin';

export interface User {
  id: string; // UUID from PostgreSQL
  email: string;
  password: string;
  type: UserType;
}

export interface CreateUserData {
  email: string;
  password: string;
  type: UserType;
}

export interface LoginCredentials {
  email: string;
  password: string;
}