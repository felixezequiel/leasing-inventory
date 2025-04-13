import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UserDTO } from '@shared/dtos/UserDto';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { TokenService } from './TokenService';
import { LoginDto, RegisterDto } from '@shared/dtos/AuthDto';

export interface AuthResult {
  user?: UserDTO;
  token?: string;
  refreshToken?: string;
  error?: string;
  success?: boolean;
  message?: string;
}

export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Registra um novo usuário
   */
  async register(registerDto: RegisterDto): Promise<AuthResult> {
    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      return { 
        error: 'User already exists' 
      };
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Criar o usuário
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    if (!user) {
      return {
        error: 'Failed to create user'
      };
    }

    // Gerar tokens
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return { 
      user, 
      token: accessToken,
      refreshToken
    };
  }

  /**
   * Autentica um usuário com email e senha
   */
  async login(loginDto: LoginDto): Promise<AuthResult> {
    // Buscar usuário
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      return { 
        error: 'Invalid credentials' 
      };
    }

    // Verificar se é uma conta Google (sem senha)
    if (!user.password && user.googleId) {
      return { 
        error: 'This account uses Google authentication. Please sign in with Google.'
      };
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isValidPassword) {
      return { 
        error: 'Invalid credentials' 
      };
    }

    // Gerar tokens
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return { 
      user, 
      token: accessToken,
      refreshToken
    };
  }

  /**
   * Atualiza o token de acesso usando um refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    if (!refreshToken) {
      return {
        error: 'Refresh token is required'
      };
    }

    // Verificar refresh token
    const userId = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!userId) {
      return {
        error: 'Invalid or expired refresh token',
      };
    }

    // Buscar usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return {
        error: 'User not found'
      };
    }

    // Gerar novos tokens
    const accessToken = this.tokenService.generateAccessToken(user.id);
    const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      token: accessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Revoga o refresh token (logout)
   */
  async logout(refreshToken: string): Promise<AuthResult> {
    if (!refreshToken) {
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }

    const result = await this.tokenService.revokeRefreshToken(refreshToken);
    
    return {
      success: result,
      message: result ? 'Logged out successfully' : 'Failed to revoke token'
    };
  }

  /**
   * Define o refresh token como cookie HTTP-only
   */
  setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias em milissegundos
      path: '/',
    });
  }

  /**
   * Remove o cookie do refresh token
   */
  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
} 