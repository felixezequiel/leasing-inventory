import { CreateUserUseCase } from '@domain/usecases/user/CreateUserUseCase';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { UpdateUserDto, CreateUserDto } from '@shared/dtos/UserDto';


export class UserService {
  private createUserUseCase: CreateUserUseCase;

  constructor(private readonly userRepository: UserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userRepository.update(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
} 