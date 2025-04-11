export class LoginDto {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class RegisterDto {
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

export class ForgotPasswordDto {
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}

export class ResetPasswordDto {
  token: string;
  password: string;

  constructor(token: string, password: string) {
    this.token = token;
    this.password = password;
  }
} 