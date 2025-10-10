import { EPermission } from "../base/Permission";

export type RoleDto = {
  id: number;
  code: string;
  name: string;
  description?: string;
  isProtected?: boolean;
};

export const defaultRoleDto: RoleDto = {
  id: 0,
  code: '',
  name: '',
  description: '',
};

export type RoleMembersDto = {
  id: string;
  userName: string;
  fullName?: string;
  avatar?: string;
  email: string;
  isActive?: boolean;
};

export type RolePermissionDto = {
  roleId: number;
  sysModule: string;
  permission: EPermission;
};

export type UserRoleDto = {
  userId: string;
  roleId: number;
};
