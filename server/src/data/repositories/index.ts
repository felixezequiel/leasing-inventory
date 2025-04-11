import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { RefreshTokenRepository } from '@domain/interfaces/repositories/RefreshTokenRepository';
import { UserRepositoryImpl } from './UserRepositoryImpl';
import { RefreshTokenRepositoryImpl } from './RefreshTokenRepositoryImpl';

class RepositoryFactory {
  private static userRepository: UserRepository;
  private static refreshTokenRepository: RefreshTokenRepository;

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepositoryImpl();
    }
    return this.userRepository;
  }

  static getRefreshTokenRepository(): RefreshTokenRepository {
    if (!this.refreshTokenRepository) {
      this.refreshTokenRepository = new RefreshTokenRepositoryImpl();
    }
    return this.refreshTokenRepository;
  }
}

export default RepositoryFactory; 