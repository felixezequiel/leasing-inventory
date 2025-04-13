import { UserDTO } from '@shared/dtos/UserDto';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import UserModel from '@infra/database/sequelize/models/User';

export class UserRepositoryImpl implements UserRepository {
  async findAll(): Promise<UserDTO[]> {
    const users = await UserModel.findAll();
    return users.map(user => user.toJSON());
  }

  async findById(id: string): Promise<UserDTO | null> {
    const user = await UserModel.findByPk(id);
    return user ? user.toJSON() : null;
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  }

  async findByGoogleId(googleId: string): Promise<UserDTO | null> {
    const user = await UserModel.findOne({ where: { googleId } });
    return user ? user.toJSON() : null;
  }

  async create(userData: Omit<UserDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserDTO> {
    const user = await UserModel.create(userData);
    return user.toJSON();
  }

  async update(id: string, data: Partial<UserDTO>): Promise<UserDTO | null> {
    const [updatedRowsCount] = await UserModel.update(data, {
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount === 0) {
      return null;
    }
    
    const updatedUser = await UserModel.findByPk(id);
    return updatedUser ? updatedUser.toJSON() : null;
  }

  async delete(id: string): Promise<boolean> {
    const deletedRowsCount = await UserModel.destroy({ where: { id } });
    return deletedRowsCount > 0;
  }
} 