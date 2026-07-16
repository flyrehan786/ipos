export interface OrderItem {
  id?: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface SaleOrder {
  id?: number;
  order_number: string;
  client_id?: number;
  client_name?: string;
  user_id?: number;
  user_name?: string;
  order_date: Date | string;
  items: OrderItem[];
  subtotal: number;
  discount_type: 'none' | 'percentage' | 'fixed';
  discount_value: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: Date;
}

export interface PurchaseOrder {
  id?: number;
  order_number: string;
  supplier_name: string;
  user_id?: number;
  user_name?: string;
  order_date: Date | string;
  items: OrderItem[];
  subtotal: number;
  discount_type: 'none' | 'percentage' | 'fixed';
  discount_value: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: Date;
}
