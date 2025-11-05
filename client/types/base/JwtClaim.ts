export type JwtClaim = {
  // JWT standard claims
  jti: string; // JWT ID (unique token identifier)
  exp: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at time (Unix timestamp)
  iss?: string; // Issuer
  aud?: string; // Audience

  // Custom user claims
  name: string; // Username
  email: string; // User email
  fullName: string; // Full name
  nameid: string; // User ID
  role: number[]; // User roles id
  roleCode?: string; // User role codes (optional)
};
