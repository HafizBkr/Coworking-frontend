import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export class AuthService {
  /**
   * Récupérer le token JWT depuis l'API d'authentification
   * Ce token sera utilisé pour l'authentification avec le backend Go
   */
  static async getJWTToken(sessionToken: string): Promise<string | null> {
    try {
      console.log('[AuthService] Getting JWT token with session token...');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[AuthService] JWT token retrieved successfully');
      return response.data.token;
    } catch (error: any) {
      console.error('[AuthService] Failed to get JWT token:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return null;
    }
  }

  /**
   * Alternative : essayer de récupérer le token depuis une autre endpoint
   */
  static async getJWTTokenAlternative(sessionToken: string): Promise<string | null> {
    try {
      console.log('[AuthService] Trying alternative method to get JWT token...');
      
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[AuthService] Alternative method successful');
      return response.data.token || sessionToken; // Fallback au token de session
    } catch (error: any) {
      console.error('[AuthService] Alternative method failed:', error.message);
      return null;
    }
  }

  /**
   * Vérifier si le token est un JWT valide
   */
  static isJWTToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload && (payload.exp || payload.iat);
    } catch {
      return false;
    }
  }

  /**
   * Décoder un token JWT
   */
  static decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }
} 