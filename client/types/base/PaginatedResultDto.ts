export type PaginatedResultDto<T> = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
};

export const defualtPaginatedResult: PaginatedResultDto<any> = {
  pageIndex: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  items: [],
};
