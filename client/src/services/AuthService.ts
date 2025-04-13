import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/env';
import { EnvironmentControl } from '@/utils/environmentControl';
import eventEmitter from '@/utils/events';
import { LoginDto, RegisterDto } from '@shared/dtos/AuthDto';
import { UserDTO } from '@shared/dtos/UserDto';
import { secureStore } from '@/utils/secureStorage';

interface TokensResponse {
  token: string;
  refreshToken?: string;
  user?: UserDTO;
  error?: string;
  requiresLogin?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: UserDTO | null;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    user: null,
    isLoading: true,
    error: null,
  };

  private tokenRefreshTimeout: NodeJS.Timeout | null = null;
  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Initialize auth state from storage
    this.loadAuthState();
  }

  // Add listener for state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Update state and notify listeners
  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Load auth state from storage
  private async loadAuthState() {
    try {
      this.setState({ isLoading: true });
      
      // Get tokens from secure storage
      const token = await this.getItem('auth_token');
      const refreshToken = await this.getItem('refresh_token');
      const userJson = await this.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        this.setState({ 
          isAuthenticated: true, 
          token, 
          refreshToken, 
          user,
          isLoading: false 
        });
        
        // Schedule token refresh
        this.scheduleTokenRefresh(token);
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.setState({ isLoading: false });
    }
  }

  // Store or retrieve from appropriate storage based on platform
  private async setItem(key: string, value: string) {
    if (EnvironmentControl.isWeb()) {
      localStorage.setItem(key, value);
    } else {
      try {
        // Try to use secure store first
        if (await secureStore.isAvailableAsync()) {
          await secureStore.setItemAsync(key, value);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        // Fallback to AsyncStorage
        await AsyncStorage.setItem(key, value);
      }
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (EnvironmentControl.isWeb()) {
      return localStorage.getItem(key);
    } else {
      try {
        // Try secure store first
        if (await secureStore.isAvailableAsync()) {
          return await secureStore.getItemAsync(key);
        } else {
          return await AsyncStorage.getItem(key);
        }
      } catch (error) {
        // Fallback to AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    }
  }

  private async removeItem(key: string) {
    if (EnvironmentControl.isWeb()) {
      localStorage.removeItem(key);
    } else {
      try {
        if (await secureStore.isAvailableAsync()) {
          await secureStore.deleteItemAsync(key);
        }
        await AsyncStorage.removeItem(key);
      } catch (error) {
        await AsyncStorage.removeItem(key);
      }
    }
  }

  // Save auth state to storage
  private async saveAuthState(token: string, user: UserDTO, refreshToken?: string) {
    await this.setItem('auth_token', token);
    if (refreshToken) {
      await this.setItem('refresh_token', refreshToken);
    }
    await this.setItem('user', JSON.stringify(user));
    
    this.setState({
      isAuthenticated: true,
      token,
      refreshToken: refreshToken ?? this.state.refreshToken,
      user,
      isLoading: false,
      error: null
    });
    
    // Schedule token refresh
    this.scheduleTokenRefresh(token);
    
    // Emit auth success event for navigation
    eventEmitter.emit('auth-success', { token, user });
  }

  // Clear auth state from storage
  private async clearAuthState() {
    await this.removeItem('auth_token');
    await this.removeItem('refresh_token');
    await this.removeItem('user');
    
    // Clear token refresh timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
    
    this.setState({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null
    });
    
    // Emit logout event for navigation
    eventEmitter.emit('auth-logout');
  }

  // Regular login with email and password
  async login(credentials: LoginDto): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const response = await fetch(config.apiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });
      
      const data = await response.json() as TokensResponse;
      
      if (data.error) {
        this.setState({ isLoading: false, error: data.error });
        return false;
      }
      
      if (data.token && data.user) {
        await this.saveAuthState(data.token, data.user, data.refreshToken);
        return true;
      }
      
      this.setState({ isLoading: false, error: 'Invalid response from server' });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      this.setState({ isLoading: false, error: errorMessage });
      return false;
    }
  }

  // Register a new user
  async register(userData: RegisterDto): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const response = await fetch(config.apiUrl + '/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Important for cookies
      });
      
      const data = await response.json() as TokensResponse;
      
      if (data.error) {
        this.setState({ isLoading: false, error: data.error });
        return false;
      }
      
      if (data.token && data.user) {
        await this.saveAuthState(data.token, data.user, data.refreshToken);
        return true;
      }
      
      this.setState({ isLoading: false, error: 'Invalid response from server' });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      this.setState({ isLoading: false, error: errorMessage });
      return false;
    }
  }

  // Send password recovery email
  async forgotPassword(email: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const response = await fetch(config.apiUrl + '/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        this.setState({ isLoading: false, error: data.error });
        return false;
      }
      
      this.setState({ isLoading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recovery email request failed';
      this.setState({ isLoading: false, error: errorMessage });
      return false;
    }
  }

  // Logout the user
  async logout(): Promise<void> {
    try {
      // Try to call logout API if we have a token
      if (this.state.token) {
        await fetch(config.apiUrl + '/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.state.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            refreshToken: this.state.refreshToken
          }),
        })
        .catch(e => console.error('Logout request failed:', e))
      }
    } finally {
      // Clear auth state regardless of API result
      await this.clearAuthState();
    }
  }

  // Refresh the access token using the refresh token
  async refreshToken(): Promise<boolean> {
    try {
      if (!this.state.refreshToken) {
        await this.clearAuthState();
        return false;
      }
      
      const response = await fetch(config.apiUrl + '/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          refreshToken: this.state.refreshToken
        }),
      });
      
      const data = await response.json() as TokensResponse;
      
      if (data.error || data.requiresLogin) {
        // If token refresh fails, log out the user
        await this.clearAuthState();
        return false;
      }
      
      if (data.token && data.user) {
        await this.saveAuthState(data.token, data.user, data.refreshToken);
        return true;
      }
      
      await this.clearAuthState();
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.clearAuthState();
      return false;
    }
  }

  // Verify if current token is valid
  async verifyToken(): Promise<boolean> {
    try {
      if (!this.state.token) {
        return false;
      }
      
      const response = await fetch(config.apiUrl + '/auth/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
        },
        credentials: 'include',
      });
      
      // Check if response has a new token header
      const newToken = response.headers.get('X-New-Access-Token');
      if (newToken) {
        // Update the token without affecting other state
        await this.setItem('auth_token', newToken);
        this.setState({ token: newToken });
        
        // Schedule refresh for the new token
        this.scheduleTokenRefresh(newToken);
      }
      
      if (response.ok) {
        const data = await response.json();
        // Update user data if returned
        if (data.user) {
          this.setState({ user: data.user });
          await this.setItem('user', JSON.stringify(data.user));
        }
        return true;
      }
      
      const data = await response.json();
      if (data.requiresLogin) {
        // Token is invalid, try to refresh
        return await this.refreshToken();
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying token:', error);
      // Try to refresh token on API errors
      return await this.refreshToken();
    }
  }

  // Schedule token refresh based on token expiration
  private scheduleTokenRefresh(token: string) {
    // Clear any existing timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    
    try {
      // Parse token to get expiration time
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { exp } = JSON.parse(jsonPayload);
      
      if (exp) {
        // Calculate time until token expiration (in milliseconds)
        const expiresIn = exp * 1000 - Date.now();
        
        // Refresh 5 minutes before expiration
        const refreshTime = Math.max(0, expiresIn - 5 * 60 * 1000);
        
        // Schedule token refresh
        this.tokenRefreshTimeout = setTimeout(() => {
          this.refreshToken().catch(console.error);
        }, refreshTime);
        
        console.log(`Token refresh scheduled in ${Math.floor(refreshTime / 60000)} minutes`);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  // Get auth header for API requests
  getAuthHeader(): Record<string, string> {
    return this.state.token 
      ? { 'Authorization': `Bearer ${this.state.token}` }
      : {};
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  // Get current user
  getUser(): UserDTO | null {
    return this.state.user;
  }

  // Get current state
  getState(): AuthState {
    return this.state;
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService; 