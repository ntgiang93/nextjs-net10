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
      return {
        jti: payload.jti, // JWT ID (unique token identifier)
        exp: payload.exp, // Expiration time (Unix timestamp)
        iat: payload.iat, // Issued at time (Unix timestamp)
        iss: payload.iss, // Issuer
        aud: payload.aud, // Audience

        // Custom user claims
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'], // Username
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'], // User email
        FullName: payload.FullName, // Full name
        Language: payload.Language, // User language preference
        nameid: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'], // User ID
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], // User roles id
        RoleCode: payload.RoleCode, // User role codes (optional)
      };
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
