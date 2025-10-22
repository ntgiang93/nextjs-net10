export type CursorPaginatedResultDto<T, TCursor> = {
  nextCursor: TCursor;
  hasMore: boolean;
  items: T[];
};

export const defaultCursorPaginatedResult: CursorPaginatedResultDto<any, any> = {
  nextCursor: null,
  hasMore: false,
  items: [],
};
