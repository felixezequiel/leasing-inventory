import { CreateUserDto, UserDTO } from '@shared/dtos/UserDto';

export interface UserRepository {
  findAll(): Promise<UserDTO[]>;
  findById(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findByGoogleId(googleId: string): Promise<UserDTO | null>;
  create(user: CreateUserDto): Promise<UserDTO>;
  update(id: string, data: Partial<UserDTO>): Promise<UserDTO | null>;
  delete(id: string): Promise<boolean>;
} 