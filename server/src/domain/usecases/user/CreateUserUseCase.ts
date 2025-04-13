import { UserDTO, CreateUserDto } from '@shared/dtos/UserDto';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: CreateUserDto): Promise<UserDTO> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Aqui poderia ter lógica adicional, como hash de senha
    
    return this.userRepository.create(userData);
  }
} 