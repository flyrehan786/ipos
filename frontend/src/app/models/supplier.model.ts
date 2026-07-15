export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
}
