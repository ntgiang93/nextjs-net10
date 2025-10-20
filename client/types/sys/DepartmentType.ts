export interface DepartmentTypeDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  level?: number;
}

export const defaultDepartmentTypeDto: DepartmentTypeDto = {
  id: 0,
  code: '',
  name: '',
  description: '',
  level: 0,
};

export interface SaveDepartmentTypeDto extends DepartmentTypeDto {}
