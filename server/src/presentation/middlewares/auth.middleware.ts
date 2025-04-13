import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
import { TokenService } from '@domain/services/TokenService';

export class AuthMiddleware implements ExpressMiddlewareInterface {
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.tokenService = new TokenService();
    this.initializePassport();
  }

  /**
   * Inicializa as estratégias de autenticação do Passport
   */
  private initializePassport(): void {
    this.configureJwtStrategy();
    this.configureGoogleStrategy();
  }

  /**
   * Configura a estratégia JWT para autenticação via token
   */
  private configureJwtStrategy(): void {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
          passReqToCallback: true,
        },
        async (req: Request, payload: any, done: any) => {
          try {
            const user = await this.userRepository.findById(payload.id);
            if (!user) {
              return done(null, false);
            }

            // Armazena o token sem o prefixo Bearer para possível renovação
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
              req.token = token;
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }

  /**
   * Configura a estratégia Google OAuth para autenticação social
   */
  private configureGoogleStrategy(): void {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('Google OAuth não configurado. Faltam GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET.');
      return;
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const baseUrl = process.env.API_URL ?? (isDevelopment ? 'http://localhost:3000' : 'https://your-production-url.com');
    const callbackURL = `${baseUrl}/auth/google/callback`;

    console.log(`Configurando Google OAuth com URL de callback: ${callbackURL}`);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          passReqToCallback: true,
          proxy: true
        },
        (req, accessToken, refreshToken, profile, done) => 
          this.handleGoogleAuthentication(req, accessToken, refreshToken, profile, done)
      )
    );
  }

  /**
   * Processa a autenticação via Google OAuth
   */
  private async handleGoogleAuthentication(
    req: Request, 
    accessToken: string, 
    refreshToken: string, 
    profile: any, 
    done: any
  ): Promise<void> {
    try {
      // Verifica se há email válido
      if (!profile.emails || profile.emails.length === 0) {
        console.error('Perfil Google não contém email');
        return done(new Error('Perfil Google não contém email'), false);
      }
      
      const email = profile.emails[0].value;
      const user = await this.findOrCreateGoogleUser(profile.id, email, profile.displayName);

      // Armazena tokens Google no objeto de requisição para uso posterior
      req.googleTokens = { accessToken, refreshToken };

      return done(null, user);
    } catch (error) {
      console.error('Erro na autenticação Google:', error);
      return done(error, false);
    }
  }

  /**
   * Encontra ou cria um usuário baseado na autenticação Google
   */
  private async findOrCreateGoogleUser(googleId: string, email: string, name: string): Promise<User> {
    // Primeiro, tenta encontrar por googleId
    let user = await this.userRepository.findByGoogleId(googleId);
    
    if (user) return user;

    // Se não encontrar por googleId, tenta por email
    user = await this.userRepository.findByEmail(email);
    
    if (user) {
      // Atualiza o usuário existente com o googleId
      const updatedUser = await this.userRepository.update(user.id, { googleId });
      if (!updatedUser) {
        throw new Error('Falha ao atualizar usuário com googleId');
      }
      return updatedUser;
    } 

    // Cria um novo usuário
    const newUser = await this.userRepository.create({
      name,
      email,
      password: '', // Google auth não precisa de senha
      googleId
    });
    
    if (!newUser) {
      throw new Error('Falha ao criar novo usuário Google');
    }
    
    return newUser;
  }

  /**
   * Middleware de autenticação para Express
   */
  async use(request: Request, response: Response, next: NextFunction): Promise<any> {
    // Verifica se a rota está marcada como pública
    if (this.isPublicRoute(request)) {
      return next();
    }

    // Verifica presença do token no cabeçalho
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return response.status(401).json({ error: 'Não autorizado - Token não fornecido' });
    }
    
    // Autentica usando passport
    return this.authenticateWithPassport(request, response, next, token);
  }

  /**
   * Verifica se a rota atual é pública (não requer autenticação)
   */
  private isPublicRoute(request: Request): boolean {
    const handler = request.route?.stack[0]?.handle;
    return !!(handler && Reflect.getMetadata('isPublic', handler));
  }

  /**
   * Extrai o token JWT do cabeçalho de autorização
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  /**
   * Autentica a requisição usando Passport JWT
   */
  private authenticateWithPassport(
    request: Request, 
    response: Response, 
    next: NextFunction, 
    token: string
  ): Promise<any> {
    return passport.authenticate('jwt', { session: false }, async (err: any, user: User | false) => {
      if (err) {
        return response.status(500).json({ error: 'Erro interno durante autenticação' });
      }
      
      if (!user) {
        // Token inválido ou expirado, tenta renovar
        return this.handleTokenRefresh(request, response, next, token);
      }
      
      // Define o usuário autenticado na requisição
      request.user = user;
      return next();
    })(request, response, next);
  }

  /**
   * Processa a renovação de token quando o token original está inválido
   */
  private async handleTokenRefresh(
    request: Request, 
    response: Response, 
    next: NextFunction, 
    originalToken: string
  ): Promise<any> {
    try {
      // Obtém refresh token do cookie ou requisição
      const refreshToken = request.cookies?.refreshToken || request.body?.refreshToken;
      
      if (!refreshToken) {
        return this.sendAuthError(response, 'Não autorizado - Autenticação necessária');
      }
      
      // Verifica refresh token
      const userId = await this.tokenService.verifyRefreshToken(refreshToken);
      if (!userId) {
        return this.sendAuthError(response, 'Não autorizado - Refresh token inválido');
      }
      
      // Obtém usuário
      const refreshedUser = await this.userRepository.findById(userId);
      if (!refreshedUser) {
        return this.sendAuthError(response, 'Não autorizado - Usuário não encontrado');
      }
      
      // Gera novo access token
      const newAccessToken = this.tokenService.generateAccessToken(refreshedUser.id);
      
      // Define usuário e token na requisição
      request.user = refreshedUser;
      request.token = originalToken;
      
      // Envia novo token no cabeçalho da resposta
      response.setHeader('X-New-Access-Token', newAccessToken);
      
      return next();
    } catch (error) {
      return this.sendAuthError(response, 'Não autorizado - Falha na autenticação');
    }
  }

  /**
   * Envia erro de autenticação padronizado
   */
  private sendAuthError(response: Response, message: string): Response {
    return response.status(401).json({ 
      error: message,
      requiresLogin: true 
    });
  }
}

// Estende a interface Request do Express para incluir user, token e googleTokens
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
      googleTokens?: {
        accessToken: string;
        refreshToken: string;
      };
    }
  }
} 