import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { randomUUID as uuidv4 } from 'crypto';

// Implementação de exemplo em memória
export class UserRepositoryImpl implements UserRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user ? { ...user } : null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedUser = {
      ...this.users[index],
      ...data,
      updatedAt: new Date()
    };
    
    this.users[index] = updatedUser;
    return { ...updatedUser };
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length !== initialLength;
  }
} 