export class UserDTO {
  id!: string;
  name!: string;
  email!: string;
  password?: string;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: UserDTO) {
    Object.assign(this, partial);
  }
}

export class CreateUserDto {
  name!: string;
  email!: string;
  password?: string;
  googleId?: string;

  constructor(partial?: CreateUserDto) {
    Object.assign(this, partial);
  }
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  googleId?: string;
  constructor(partial?: Partial<UpdateUserDto>) {
    Object.assign(this, partial);
  }
}

export class LoginUserDto {
  email!: string;
  password!: string;

  constructor(partial?: Partial<LoginUserDto>) {
    Object.assign(this, partial);
  }
}
