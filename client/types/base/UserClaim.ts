export interface UserClaim {
  id: string;
  username: string; // Username
  email: string; // User email
  firstName: string; // First name
  lastName: string; // Last name
  language: string; // User language preference
  role: string[];
}

export const defaultUserClaim: UserClaim = {
  id: '',
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  language: 'vi',
  role: [],
};

export const mapJwtClaimToUserClaim = (jwtClaim: any): UserClaim => {
  return {
    id: jwtClaim?.nameid || '',
    username: jwtClaim?.username || '',
    email: jwtClaim?.email || '',
    firstName: jwtClaim?.firstName || '',
    lastName: jwtClaim?.lastName || '',
    language: jwtClaim?.language || 'en-US',
    role: jwtClaim?.role || [],
  };
};
