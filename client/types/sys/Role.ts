export type RoleDto = {
  id: string;
  code: string;
  name: string;
  description?: string;
  isProtected?: boolean;
};

export const defaultRoleDto: RoleDto = {
  id: '0',
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
  role: string;
  sysModule: string;
  permission: string;
};

export type UserRoleDto = {
  userId: string;
  roleId: string;
};
