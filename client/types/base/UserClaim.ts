import { defaultUserDto, UserDto } from '../sys/User';
import { JwtClaim } from './JwtClaim';

export type UserClaim = UserDto & {
  language: string; // User language preference
  roleCode: string; // User role codes (optional)
};

export const defaultUserClaim: UserClaim = {
  ...defaultUserDto,
  language: 'vi',
  roleCode: '',
};

export const mapJwtClaimToUserClaim = (jwtClaim: JwtClaim): UserClaim => {
  return {
    id: jwtClaim?.nameid || '',
    userName: jwtClaim?.name || '',
    language: jwtClaim?.Language || 'vi-VN',
    roles: jwtClaim?.role || [],
    roleCode: jwtClaim?.RoleCode || '',
    avatar: '',
    email: '',
    phone: '',
    fullName: '',
    isActive: false,
    twoFa: false,
    lockExprires: undefined,
    rolesName: [],
  };
};
