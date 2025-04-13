export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
} 