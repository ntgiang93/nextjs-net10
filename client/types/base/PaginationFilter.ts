export interface PaginationFilter {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

export const defaultPaginationFilter: PaginationFilter = {
  page: 1,
  pageSize: 20,
  searchTerm: '',
};
