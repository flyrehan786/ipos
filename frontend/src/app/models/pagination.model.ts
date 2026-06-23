export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  total_count: number;
}
