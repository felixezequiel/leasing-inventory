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
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
          },
          async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
              let user = await this.userRepository.findByEmail(profile.emails[0].value);

              if (!user) {
                user = await this.userRepository.create({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  password: '', // Google auth não precisa de senha
                });
              }

              return done(null, user);
            } catch (error) {
              return done(error, false);
            }
          }
        )
      );
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