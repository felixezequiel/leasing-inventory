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
import axios from 'axios';

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
      port: parseInt(process.env.SMTP_PORT ?? '587'),
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
    // Em vez de retornar diretamente, vamos usar o middleware dentro de uma Promise
    return new Promise((resolve) => {
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
      })(req, res, () => {
        // Este callback será chamado após a autenticação
        resolve(true);
      });
    });
  }

  @Get('/google/callback')
  @Public()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve) => {
      passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if (err || !user) {
          console.error('Google authentication failed:', err);
          const errorRedirectUrl = process.env.CLIENT_URL 
            ? `${process.env.CLIENT_URL}/auth?error=google-auth-failed` 
            : '/auth/login?error=google-auth-failed';
          res.redirect(errorRedirectUrl);
          return resolve(true);
        }

        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1d' }
        );

        // Check if the request comes from a mobile app (has a custom redirect scheme)
        const userAgent = req.headers['user-agent'] || '';
        const isMobileApp = req.query.platform === 'mobile' || 
                           /expo|android|ios|mobile/i.test(userAgent);
        
        console.log('Authentication successful for user:', user.email);
        console.log('Platform detection:', { 
          isMobileApp, 
          platform: req.query.platform, 
          userAgent: userAgent.substring(0, 50) + '...' 
        });

        if (isMobileApp) {
          // Mobile redirect using deep linking
          const mobileScheme = process.env.MOBILE_SCHEME || 'leasing-inventory';
          const redirectUrl = `${mobileScheme}://auth?token=${token}`;
          console.log('Redirecting to mobile app:', redirectUrl);
          res.redirect(redirectUrl);
        } else {
          // Web redirect
          const webRedirectUrl = process.env.CLIENT_URL 
            ? `${process.env.CLIENT_URL}?token=${token}` 
            : `/?token=${token}`;
          console.log('Redirecting to web client:', webRedirectUrl);
          res.redirect(webRedirectUrl);
        }
        
        resolve(true);
      })(req, res, () => {});
    });
  }

  @Post('/google/token')
  @Public()
  async exchangeGoogleToken(@Body() tokenRequest: { code: string; redirectUri: string }) {
    try {
      console.log('Recebida solicitação para trocar código Google por token');
      
      // Trocar o código do Google por tokens de acesso/ID
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code: tokenRequest.code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: tokenRequest.redirectUri,
          grant_type: 'authorization_code'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Extrair tokens
      const { access_token, id_token } = tokenResponse.data;

      // Obter informações do usuário
      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );

      const { sub: googleId, email, name } = userInfoResponse.data;

      // Buscar ou criar usuário
      let user = await this.userRepository.findByGoogleId(googleId);
      
      if (!user) {
        user = await this.userRepository.findByEmail(email);
        
        if (user) {
          // Atualizar usuário existente com o googleId
          user = await this.userRepository.update(user.id, {
            googleId
          });
        } else {
          // Criar novo usuário
          user = await this.userRepository.create({
            name,
            email,
            password: '',
            googleId
          });
        }
      }

      // Verificar se o usuário existe
      if (!user) {
        return { error: 'Falha ao criar ou atualizar usuário' };
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      return { token };
    } catch (error: any) {
      console.error('Erro ao trocar código por token:', error.response?.data || error.message);
      return { error: 'Falha na autenticação do Google' };
    }
  }

  @Post('/google/profile')
  @Public()
  async processGoogleProfile(@Body() profileData: { googleId: string; email: string; name: string }) {
    try {
      console.log('Recebida solicitação para processar perfil Google:', profileData);
      
      if (!profileData.googleId || !profileData.email) {
        return { error: 'Dados de perfil Google incompletos' };
      }

      // Buscar ou criar usuário usando as informações do perfil
      let user = await this.userRepository.findByGoogleId(profileData.googleId);
      
      if (!user) {
        user = await this.userRepository.findByEmail(profileData.email);
        
        if (user) {
          // Atualizar usuário existente com o googleId
          user = await this.userRepository.update(user.id, {
            googleId: profileData.googleId
          });
        } else {
          // Criar novo usuário
          user = await this.userRepository.create({
            name: profileData.name,
            email: profileData.email,
            password: '',
            googleId: profileData.googleId
          });
        }
      }

      // Verificar se o usuário existe
      if (!user) {
        return { error: 'Falha ao criar ou atualizar usuário' };
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      return { token };
    } catch (error: any) {
      console.error('Erro ao processar perfil Google:', error.message);
      return { error: 'Falha ao processar autenticação Google' };
    }
  }
} 