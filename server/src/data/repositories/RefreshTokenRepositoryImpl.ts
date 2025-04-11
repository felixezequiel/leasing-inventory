import { RefreshToken, RefreshTokenRepository } from '@domain/interfaces/repositories/RefreshTokenRepository';
import RefreshTokenModel from '@infra/database/sequelize/models/RefreshToken';

export class RefreshTokenRepositoryImpl implements RefreshTokenRepository {
  async create(data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshToken> {
    const refreshToken = await RefreshTokenModel.create(data);
    return refreshToken.toJSON();
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshTokenModel.findOne({ where: { token } });
    return refreshToken ? refreshToken.toJSON() : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const refreshTokens = await RefreshTokenModel.findAll({ where: { userId } });
    return refreshTokens.map(token => token.toJSON());
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await RefreshTokenModel.destroy({ where: { id } });
    return deletedCount > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const deletedCount = await RefreshTokenModel.destroy({ where: { userId } });
    return deletedCount > 0;
  }

  async deleteByToken(token: string): Promise<boolean> {
    const deletedCount = await RefreshTokenModel.destroy({ where: { token } });
    return deletedCount > 0;
  }
} 