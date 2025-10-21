export type DepartmentTypeDto = {
  id: number;
  code: string;
  name: string;
  description?: string;
  level?: number;
};

export const defaultDepartmentTypeDto: DepartmentTypeDto = {
  id: 0,
  code: '',
  name: '',
  description: '',
  level: 0,
};

export type SaveDepartmentTypeDto = DepartmentTypeDto;
