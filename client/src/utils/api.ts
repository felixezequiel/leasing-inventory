import { config } from '@/config/env';
import authService, { handleApiResponse } from '@/services/AuthService';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Utilitário para fazer chamadas à API com tratamento de autenticação
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { requiresAuth = true, ...fetchOptions } = options;
  
  // URL completa da API
  const url = `${config.apiUrl}${endpoint}`;
  
  // Configuração padrão
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
  };
  
  // Adiciona o token de autenticação ao cabeçalho se necessário
  if (requiresAuth) {
    const authHeader = authService.getAuthHeader();
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...authHeader,
    };
  }
  
  // Mescla as opções
  const requestOptions = {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers,
    },
  };
  
  try {
    // Executa a requisição
    const response = await fetch(url, requestOptions);
    
    // Verifica erros de autenticação
    await handleApiResponse(response);
    
    // Verifica se a resposta é bem-sucedida
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }
    
    // Se a resposta for 204 (No Content) ou não tiver corpo, retorna null
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }
    
    // Retorna os dados como JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Relança o erro para tratamento pelo chamador
    throw error;
  }
};

// Métodos facilitadores
export const get = <T>(endpoint: string, options?: ApiOptions) => 
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

export const post = <T>(endpoint: string, data: any, options?: ApiOptions) => 
  apiRequest<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });

export const put = <T>(endpoint: string, data: any, options?: ApiOptions) => 
  apiRequest<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });

export const patch = <T>(endpoint: string, data: any, options?: ApiOptions) => 
  apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) });

export const del = <T>(endpoint: string, options?: ApiOptions) => 
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' }); 