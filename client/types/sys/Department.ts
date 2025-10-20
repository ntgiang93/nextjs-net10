export interface DepartmentDto {
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
}

export interface DetailDepartmentDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  departmentTypeCode: string;
  parentId?: number;
  address?: string;
  treePath: string;
}

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
