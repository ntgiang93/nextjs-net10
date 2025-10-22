import { defaultPaginationFilter, PaginationFilter } from '../base/PaginationFilter';

export type DepartmentDto = {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentTypeCode: string;
  departmentTypeName: string;
  departmentTypeLevel: number;
  parentId?: number;
  address?: string;
  children?: DepartmentDto[];
};

export type DetailDepartmentDto = {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentTypeCode: string;
  parentId?: number;
  address?: string;
  treePath: string;
};

export const defaultDetailDepartmentDto: DetailDepartmentDto = {
  id: 0,
  name: '',
  code: '',
  description: '',
  departmentTypeCode: '',
  parentId: undefined,
  address: '',
  treePath: '',
};

export type DepartmentMemberDto = {
  id: string;
  userName: string;
  fullName?: string;
  avatar?: string;
  email?: string;
  isActive?: boolean;
};

export type DepartmentMemberFilter = PaginationFilter & {
  departmentId: number;
  isShowChildrenMembers: boolean;
};

export const defaultDepartmentMemberFilter: DepartmentMemberFilter = {
  ...defaultPaginationFilter,
  departmentId: 0,
  isShowChildrenMembers: false,
};

export type AddDepartmentMemberDto = {
  departmentId: number;
  userIds: string[];
};

export type UserDepartmentCursorFilterDto = {
  searchTerm: string;
  departmentId: number;
  limit: number;
  /// <summary>
  /// cursor by created time
  /// </summary>
  cursor: string | null;
};

export const defaultUserDepartmentCursorFilterDto: UserDepartmentCursorFilterDto = {
  searchTerm: '',
  departmentId: 0,
  limit: 50,
  cursor: null,
};
