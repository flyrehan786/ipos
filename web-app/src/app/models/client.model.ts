export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  credit_limit: number;
  status: 'active' | 'inactive';
  balance?: number;
  created_at?: Date;
}
