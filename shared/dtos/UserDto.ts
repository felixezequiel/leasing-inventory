export class UserDTO {
  id: string;
  name: string;
  email: string;
  password: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<UserDTO>) {
    Object.assign(this, data);
  }
}

export class CreateUserDto {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  googleId?: string;
}