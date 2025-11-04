export type CategoryDto = {
  id: number;
  name: string;
  code: string;
  type: string;
  description?: string;
};

export const defaultCategory: CategoryDto = {
  id: 0,
  name: '',
  code: '',
  type: '',
  description: '',
};

export type CategoryTreeDto = CategoryDto & {
  children?: CategoryTreeDto[];
};
