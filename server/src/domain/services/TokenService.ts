import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenRepository } from '@domain/interfaces/repositories/RefreshTokenRepository';
import { RefreshTokenRepositoryImpl } from '@data/repositories/RefreshTokenRepositoryImpl';

export class TokenService {
  private readonly refreshTokenRepository: RefreshTokenRepository;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshTokenExpiresIn: number; // in days

  constructor() {
    this.refreshTokenRepository = new RefreshTokenRepositoryImpl();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshTokenExpiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '30'); // 30 days default
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(userId: string): string {
    // Using type assertion to bypass TypeScript type checking for jwt.sign
    // @ts-ignore
    return jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Generate refresh token and save it to the database
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // Delete any existing refresh tokens for this user (optional)
    await this.refreshTokenRepository.deleteByUserId(userId);

    // Generate new refresh token
    const refreshToken = uuidv4();
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiresIn);

    // Save to database
    await this.refreshTokenRepository.create({
      userId,
      token: refreshToken,
      expiresAt
    });

    return refreshToken;
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { id: string };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<string | null> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    
    if (!refreshToken) {
      return null;
    }
    
    // Check if refresh token is expired
    if (new Date() > refreshToken.expiresAt) {
      await this.refreshTokenRepository.deleteByToken(token);
      return null;
    }
    
    return refreshToken.userId;
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    return this.refreshTokenRepository.deleteByToken(token);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<boolean> {
    return this.refreshTokenRepository.deleteByUserId(userId);
  }
} 