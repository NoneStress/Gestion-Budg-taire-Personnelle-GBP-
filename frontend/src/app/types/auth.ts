export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthUser {
  email: string;
  password: string;
  name?: string;
}
