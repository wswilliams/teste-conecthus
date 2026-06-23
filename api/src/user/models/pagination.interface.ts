export interface IPaginationOptions {
  page: number;
  limit: number;
  route: string;
}

export interface PaginationLinks {
  first: string;
  previous: string;
  next: string;
  last: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface Pagination<T> {
  items: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}
