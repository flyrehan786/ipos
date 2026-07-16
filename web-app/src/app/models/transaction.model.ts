export interface Transaction {
  id?: number;
  transaction_type: 'income' | 'expense';
  reference_type?: string;
  reference_id?: number;
  amount: number;
  payment_method: string;
  transaction_date: Date | string;
  notes?: string;
  user_id?: number;
  user_name?: string;
  created_at?: Date;
}
