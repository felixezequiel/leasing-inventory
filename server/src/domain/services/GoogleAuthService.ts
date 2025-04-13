import axios from 'axios';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/UserRepository';

export class GoogleAuthService {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Troca o código de autorização Google por tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ 
    access_token: string;
    id_token: string;
  }> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      access_token: response.data.access_token,
      id_token: response.data.id_token
    };
  }

  /**
   * Obtém informações do perfil do usuário Google
   */
  async getUserInfo(accessToken: string): Promise<{
    googleId: string;
    email: string;
    name: string;
  }> {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const { sub: googleId, email, name } = response.data;
    return { googleId, email, name };
  }

  /**
   * Localiza ou cria um usuário baseado nas informações do Google
   */
  async findOrCreateGoogleUser(googleId: string, email: string, name: string): Promise<User> {
    // Primeiro, tenta encontrar por googleId
    let user = await this.userRepository.findByGoogleId(googleId);
    
    if (user) return user;

    // Se não encontrar por googleId, tenta por email
    user = await this.userRepository.findByEmail(email);
    
    if (user) {
      // Atualiza o usuário existente com o googleId
      const updatedUser = await this.userRepository.update(user.id, { googleId });
      if (!updatedUser) {
        throw new Error('Failed to update user with Google ID');
      }
      return updatedUser;
    }

    // Cria um novo usuário
    const newUser = await this.userRepository.create({
      name: name || email.split('@')[0],
      email,
      password: '', // Google auth não precisa de senha
      googleId
    });
    
    if (!newUser) {
      throw new Error('Failed to create new Google user');
    }
    
    return newUser;
  }

  /**
   * Processa o código de autorização Google e retorna o usuário
   */
  async processAuthCode(code: string, redirectUri: string): Promise<User> {
    // Trocar o código do Google por tokens
    const { access_token } = await this.exchangeCodeForTokens(code, redirectUri);
    
    // Obter informações do usuário
    const { googleId, email, name } = await this.getUserInfo(access_token);
    
    // Buscar ou criar usuário
    return this.findOrCreateGoogleUser(googleId, email, name);
  }

  /**
   * Processa o perfil do Google diretamente
   */
  async processGoogleProfile(profileData: { googleId: string; email: string; name: string }): Promise<User> {
    return this.findOrCreateGoogleUser(
      profileData.googleId,
      profileData.email,
      profileData.name
    );
  }
} 