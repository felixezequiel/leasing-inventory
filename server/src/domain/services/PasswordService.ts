import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { TokenService } from './TokenService';
import { ForgotPasswordDto, ResetPasswordDto } from '@shared/dtos/AuthDto';

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class PasswordService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {
    this.initializeEmailTransporter();
  }

  /**
   * Inicializa o transportador de email
   */
  private initializeEmailTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<PasswordResetResult> {
    const user = await this.userRepository.findByEmail(forgotPasswordDto.email);
    
    if (!user) {
      return { 
        success: false,
        error: 'User not found' 
      };
    }

    // Gerar token de recuperação com propósito específico
    const resetToken = jwt.sign(
      { id: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Construir link de recuperação
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    try {
      // Enviar email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetEmailTemplate(resetLink),
      });

      return { 
        success: true,
        message: 'Recovery email sent successfully' 
      };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        error: 'Failed to send recovery email'
      };
    }
  }

  /**
   * Redefine a senha do usuário usando o token de recuperação
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<PasswordResetResult> {
    try {
      // Verificar token
      const decoded = jwt.verify(
        resetPasswordDto.token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { id: string; type: string };

      // Validar que o token tem o propósito correto
      if (decoded.type !== 'password-reset') {
        return { 
          success: false,
          error: 'Invalid token type' 
        };
      }

      // Criar hash da nova senha
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      
      // Atualizar senha do usuário
      const user = await this.userRepository.update(decoded.id, {
        password: hashedPassword,
      });

      if (!user) {
        return { 
          success: false,
          error: 'User not found' 
        };
      }

      // Revogar todos os refresh tokens para forçar re-login
      await this.tokenService.revokeAllUserRefreshTokens(user.id);

      return { 
        success: true,
        message: 'Password updated successfully' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Password reset failed:', errorMessage);
      
      return { 
        success: false,
        error: 'Invalid or expired token' 
      };
    }
  }

  /**
   * Retorna o template HTML para o email de recuperação de senha
   */
  private getPasswordResetEmailTemplate(resetLink: string): string {
    return `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
  }
} 