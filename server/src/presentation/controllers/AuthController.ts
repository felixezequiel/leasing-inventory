import { Controller, Post, Body, Get, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';
import passport from 'passport';
import { Public } from '../decorators/auth.decorator';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '@shared/dtos/AuthDto';
import { AuthenticationService } from '@domain/services/AuthenticationService';
import { GoogleAuthService } from '@domain/services/GoogleAuthService';
import { PasswordService } from '@domain/services/PasswordService';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
import { TokenService } from '@domain/services/TokenService';

@Controller('/auth')
export class AuthController {
  private readonly authService: AuthenticationService;
  private readonly googleAuthService: GoogleAuthService;
  private readonly passwordService: PasswordService;

  constructor() {
    const userRepository = new UserRepositoryImpl();
    const tokenService = new TokenService();
    
    this.authService = new AuthenticationService(userRepository, tokenService);
    this.googleAuthService = new GoogleAuthService(userRepository);
    this.passwordService = new PasswordService(userRepository, tokenService);
  }

  /**
   * Registra um novo usuário
   */
  @Post('/register')
  @Public()
  async register(@Body() registerDto: RegisterDto, @Res() response: Response) {
    const result = await this.authService.register(registerDto);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Define o refresh token como cookie
    if (result.refreshToken) {
      this.authService.setRefreshTokenCookie(response, result.refreshToken);
    }
    
    return { 
      user: result.user, 
      token: result.token 
    };
  }

  /**
   * Autentica um usuário com email e senha
   */
  @Post('/login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const result = await this.authService.login(loginDto);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Define o refresh token como cookie
    if (result.refreshToken) {
      this.authService.setRefreshTokenCookie(response, result.refreshToken);
    }
    
    return { 
      user: result.user, 
      token: result.token 
    };
  }

  /**
   * Atualiza tokens usando refresh token
   */
  @Post('/refresh-token')
  @Public()
  async refreshToken(@Req() request: Request, @Res() response: Response) {
    // Obtém refresh token do cookie ou corpo da requisição
    const refreshToken = request.cookies?.refreshToken || request.body.refreshToken;
    const result = await this.authService.refreshToken(refreshToken);
    
    if (result.error) {
      return { 
        error: result.error, 
        requiresLogin: true 
      };
    }
    
    // Define o novo refresh token como cookie
    if (result.refreshToken) {
      this.authService.setRefreshTokenCookie(response, result.refreshToken);
    }
    
    return {
      user: result.user,
      token: result.token
    };
  }

  /**
   * Finaliza a sessão do usuário
   */
  @Post('/logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    // Obtém refresh token do cookie ou corpo da requisição
    const refreshToken = request.cookies?.refreshToken || request.body.refreshToken;
    const result = await this.authService.logout(refreshToken);
    
    // Limpa o cookie do refresh token
    this.authService.clearRefreshTokenCookie(response);
    
    return { 
      success: result.success, 
      message: result.message 
    };
  }

  /**
   * Inicia processo de recuperação de senha
   */
  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.passwordService.forgotPassword(forgotPasswordDto);
    
    if (!result.success) {
      return { error: result.error };
    }
    
    return { message: result.message };
  }

  /**
   * Redefine a senha com token de recuperação
   */
  @Post('/reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.passwordService.resetPassword(resetPasswordDto);
    
    if (!result.success) {
      return { error: result.error };
    }
    
    return { message: result.message };
  }

  /**
   * Verifica se o token é válido
   */
  @Get('/verify-token')
  async verifyToken(@Req() request: Request) {
    // Esta rota é protegida pelo middleware de autenticação
    // Se chegamos aqui, o token é válido
    return { 
      isValid: true, 
      user: request.user 
    };
  }

  /**
   * Inicia o fluxo de autenticação Google
   */
  @Get('/google')
  @Public()
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve) => {
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
      })(req, res, () => {
        resolve(true);
      });
    });
  }

  /**
   * Callback para autenticação Google
   */
  @Get('/google/callback')
  @Public()
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve) => {
      passport.authenticate('google', { session: false }, async (err: any, user: any) => {
        if (err || !user) {
          console.error('Google authentication failed:', err);
          const errorRedirectUrl = process.env.CLIENT_URL 
            ? `${process.env.CLIENT_URL}/auth?error=google-auth-failed` 
            : '/auth?error=google-auth-failed';
          res.redirect(errorRedirectUrl);
          return resolve(true);
        }

        // Gerar tokens
        const accessToken = this.authService['tokenService'].generateAccessToken(user.id);
        const refreshToken = await this.authService['tokenService'].generateRefreshToken(user.id);
        
        // Define refresh token como cookie
        this.authService.setRefreshTokenCookie(res, refreshToken);

        // Verifica se a requisição vem de um app móvel
        const userAgent = req.headers['user-agent'] || '';
        const isMobileApp = req.query.platform === 'mobile' || 
                          /expo|android|ios|mobile/i.test(userAgent);
        
        console.log('Autenticação bem-sucedida para usuário:', user.email);

        if (isMobileApp) {
          // Redirecionamento para app móvel usando deep linking
          const mobileScheme = process.env.MOBILE_SCHEME || 'leasing-inventory';
          const redirectUrl = `${mobileScheme}://auth?token=${accessToken}&refreshToken=${refreshToken}`;
          res.redirect(redirectUrl);
        } else {
          // Redirecionamento para web
          const webRedirectUrl = process.env.CLIENT_URL 
            ? `${process.env.CLIENT_URL}?token=${accessToken}` 
            : `/?token=${accessToken}`;
          res.redirect(webRedirectUrl);
        }
        
        resolve(true);
      })(req, res, () => {});
    });
  }

  /**
   * Troca código de autorização Google por token
   */
  @Post('/google/token')
  @Public()
  async exchangeGoogleToken(@Body() tokenRequest: { code: string; redirectUri: string }, @Res() response: Response) {
    try {
      // Processa o código de autorização Google
      const user = await this.googleAuthService.processAuthCode(
        tokenRequest.code, 
        tokenRequest.redirectUri
      );

      if (!user) {
        return { error: 'Failed to authenticate with Google' };
      }

      // Gerar tokens
      const accessToken = this.authService['tokenService'].generateAccessToken(user.id);
      const refreshToken = await this.authService['tokenService'].generateRefreshToken(user.id);
      
      // Define o refresh token como cookie
      this.authService.setRefreshTokenCookie(response, refreshToken);

      return {
        user,
        token: accessToken
      };
    } catch (error) {
      console.error('Error exchanging Google token:', error);
      return { error: 'Failed to authenticate with Google' };
    }
  }

  /**
   * Processa perfil Google para autenticação
   */
  @Post('/google/profile')
  @Public()
  async processGoogleProfile(
    @Body() profileData: { googleId: string; email: string; name: string }, 
    @Res() response: Response
  ) {
    try {
      // Processa o perfil Google
      const user = await this.googleAuthService.processGoogleProfile(profileData);
      
      if (!user) {
        return { error: 'Failed to process Google profile' };
      }

      // Gerar tokens
      const accessToken = this.authService['tokenService'].generateAccessToken(user.id);
      const refreshToken = await this.authService['tokenService'].generateRefreshToken(user.id);
      
      // Define o refresh token como cookie
      this.authService.setRefreshTokenCookie(response, refreshToken);

      return {
        user,
        token: accessToken
      };
    } catch (error) {
      console.error('Error processing Google profile:', error);
      return { error: 'Failed to process Google profile' };
    }
  }
} 