import { Controller, Post, Body, Get, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
import { Public } from '../decorators/auth.decorator';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '@shared/dtos/AuthDto';

@Controller('/auth')
export class AuthController {
  private readonly userRepository: UserRepository;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @Post('/register')
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return { user, token };
  }

  @Post('/login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isValidPassword) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return { user, token };
  }

  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(forgotPasswordDto.email);
    if (!user) {
      return { error: 'User not found' };
    }

    // Gerar token de recuperação de senha
    const resetToken = jwt.sign(
      { id: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Enviar email com link de recuperação
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { message: 'Recovery email sent successfully' };
  }

  @Post('/reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      // Verificar token
      const decoded = jwt.verify(
        resetPasswordDto.token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { id: string; type: string };

      if (decoded.type !== 'password-reset') {
        return { error: 'Invalid token' };
      }

      // Atualizar senha
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      const user = await this.userRepository.update(decoded.id, {
        password: hashedPassword,
      });

      if (!user) {
        return { error: 'User not found' };
      }

      return { message: 'Password updated successfully' };
    } catch (error) {
      return { error: 'Invalid or expired token' };
    }
  }

  @Get('/google')
  @Public()
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    return passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res);
  }

  @Get('/google/callback')
  @Public()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    passport.authenticate('google', { session: false }, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect('/auth/login?error=google-auth-failed');
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      // Redireciona para a página inicial com o token
      res.redirect(`/?token=${token}`);
    })(req, res);
  }
} 