import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: { name: string; email: string; password: string }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Aqui poderia ter lógica adicional, como hash de senha
    
    return this.userRepository.create(userData);
  }
} 