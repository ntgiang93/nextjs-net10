import { PaginationFilter } from '../base/PaginationFilter';

// Based on UserDto
export type UserDto = {
  id: string;
  userName: string;
  avatar: string;
  email: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  isLocked?: boolean;
  twoFa: boolean;
  lockExprires: Date;
  roles: string[];
  rolesName: string[];
};

export const defaultUserDto: UserDto = {
  id: '',
  userName: '',
  avatar: '',
  email: '',
  phone: '',
  fullName: '',
  isActive: false,
  twoFa: false,
  isLocked: false,
  lockExprires: new Date(),
  roles: [],
  rolesName: [],
};

// Based on UpdateUserDto
export type UpdateUserDto = {
  id: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  twoFa: boolean;
};

export type SaveUserDto = {
  id: string;
  fullName: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
};

export const defaultCreateUserDto: SaveUserDto = {
  id: '',
  fullName: '',
  userName: '',
  email: '',
  phoneNumber: '',
  roles: [],
};

// Based on UserTableDto
export type UserTableDto = {
  id: string;
  userName: string;
  avatar: string;
  email: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  isLocked: boolean;
  roles: string[];
};

export type UserSelectDto = {
  id: string;
  userName: string;
  avatar: string;
  email: string;
  fullName: string;
};

// Based on UserTableRequestDto
export type UserTableRequestDto = PaginationFilter & {
  roles: string[];
  isActive?: boolean;
  isLocked?: boolean;
};

export const defaultUserTableRequest: UserTableRequestDto = {
  searchTerm: '',
  page: 1,
  pageSize: 20,
  roles: [],
  isActive: undefined,
  isLocked: undefined,
};

export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const defaultChangePasswordDto: ChangePasswordDto = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};
