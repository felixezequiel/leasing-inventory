import { CreateUserUseCase } from '@domain/usecases/user/CreateUserUseCase';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { UpdateUserDto, CreateUserDto, UserDTO } from '@shared/dtos/UserDto';


export class UserService {
  private readonly createUserUseCase: CreateUserUseCase;

  constructor(private readonly userRepository: UserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
  }

  async getAllUsers(): Promise<UserDTO[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    return this.userRepository.findById(id);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDTO> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserDTO | null> {
    return this.userRepository.update(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
} 