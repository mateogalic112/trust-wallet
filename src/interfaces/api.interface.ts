export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: {
    id: number;
  } | null;
}
