import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';

export class AuthMiddleware implements ExpressMiddlewareInterface {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.initializePassport();
  }

  private initializePassport() {
    // JWT Strategy
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
        },
        async (payload: any, done: any) => {
          try {
            const user = await this.userRepository.findById(payload.id);
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const baseUrl = process.env.API_URL ?? (isDevelopment ? 'http://localhost:3000' : 'https://your-production-url.com');
      const callbackURL = `${baseUrl}/auth/google/callback`;

      console.log(`Configuring Google OAuth with callback URL: ${callbackURL}`);
      
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL,
            passReqToCallback: true,
            proxy: true
          },
          async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
              // Verificar se temos um email válido
              if (!profile.emails || profile.emails.length === 0) {
                console.error('Google profile does not contain email');
                return done(new Error('Google profile does not contain email'), false);
              }
              
              const email = profile.emails[0].value;
              
              // Primeiro, tenta encontrar por googleId
              let user = await this.userRepository.findByGoogleId(profile.id);
              
              if (!user) {
                // Se não encontrar por googleId, tenta por email
                user = await this.userRepository.findByEmail(email);
                
                if (user) {
                  // Atualiza o usuário existente com o googleId
                  user = await this.userRepository.update(user.id, {
                    googleId: profile.id
                  });
                } else {
                  // Cria um novo usuário
                  user = await this.userRepository.create({
                    name: profile.displayName,
                    email: email,
                    password: '', // Google auth não precisa de senha
                    googleId: profile.id
                  });
                }
              }

              return done(null, user);
            } catch (error) {
              console.error('Error in Google authentication:', error);
              return done(error, false);
            }
          }
        )
      );
    } else {
      console.warn('Google OAuth not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
    }
  }

  async use(request: Request, response: Response, next: NextFunction): Promise<any> {
    const handler = request.route?.stack[0]?.handle;
    
    if (handler && Reflect.getMetadata('isPublic', handler)) {
      return next();
    }

    return passport.authenticate('jwt', { session: false })(request, response, next);
  }
} 