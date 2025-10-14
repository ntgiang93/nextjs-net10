import { JwtClaim } from './JwtClaim';

export interface UserClaim {
  id: string;
  username: string; // Username
  email: string; // User email
  fullName: string; // First name
  language: string; // User language preference
  role: number[];
  roleCode: string;
}

export const defaultUserClaim: UserClaim = {
  id: '',
  username: '',
  email: '',
  fullName: '',
  language: 'vi',
  role: [],
  roleCode: '',
};

export const mapJwtClaimToUserClaim = (jwtClaim: JwtClaim): UserClaim => {
  return {
    id: jwtClaim?.nameid || '',
    username: jwtClaim?.name || '',
    email: jwtClaim?.email || '',
    fullName: jwtClaim?.FullName || '',
    language: jwtClaim?.Language || 'en-US',
    role: jwtClaim?.role || [],
    roleCode: jwtClaim?.RoleCode || '',
  };
};
