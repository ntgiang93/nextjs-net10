import { defaultPaginationFilter, PaginationFilter } from '../base/PaginationFilter';
import { EPermission } from '../base/Permission';

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

export type RoleMemberFilter = PaginationFilter & {
  roleId: number;
};

export const defaultRoleMemberFilter: RoleMemberFilter = {
  ...defaultPaginationFilter,
  roleId: 0,
};

export type AddRoleMemberDto = {
  roleId: number;
  userIds: string[];
};

export type RemoveRoleMemberDto = {
  roleId: number;
  userIds: string[];
};

export type UserRoleCursorFilterDto = {
  searchTerm: string;
  roleId: number;
  limit: number;
  cursor: string | null;
};

export const defaultUserRoleCursorFilterDto: UserRoleCursorFilterDto = {
  searchTerm: '',
  roleId: 0,
  limit: 50,
  cursor: null,
};
