import { JwtClaim } from '@/types/base/JwtClaim';

export const JwtHelper = {
  /**
   * Decode a JWT token without verifying signature
   * @param token - The JWT token string
   * @returns The decoded token payload or null if invalid
   */
  decodeToken(token: string): JwtClaim | undefined {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return undefined;
    }
  },

  /**
   * Check if the token is expired
   * @param token - The JWT token string or decoded token
   * @returns True if token is expired, false otherwise
   */
  isTokenExpired(token: string | JwtClaim): boolean {
    const decoded = typeof token === 'string' ? this.decodeToken(token) : token;
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  },
};
