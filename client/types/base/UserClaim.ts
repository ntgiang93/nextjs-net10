import { defaultUserDto, UserDto } from '../sys/User';
import { JwtClaim } from './JwtClaim';

export type UserClaim = UserDto & {
  roleCode: string; // User role codes (optional)
};

export const defaultUserClaim: UserClaim = {
  ...defaultUserDto,
  roleCode: '',
};

export const mapJwtClaimToUserClaim = (jwtClaim: JwtClaim): UserClaim => {
  return {
    id: jwtClaim?.nameid || '',
    userName: jwtClaim?.name || '',
    roles: jwtClaim?.role || [],
    roleCode: jwtClaim?.roleCode || '',
    avatar: '',
    email: jwtClaim?.email || '',
    phone: '',
    fullName: jwtClaim?.fullName || '',
    isActive: false,
    twoFa: false,
    lockExprires: undefined,
    rolesName: [],
  };
};
