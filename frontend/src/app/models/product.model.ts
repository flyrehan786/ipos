export interface Product {
  id?: number;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: string;
  unit: string;
  purchase_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock_level: number;
  status: 'active' | 'inactive';
  created_at?: Date;
}
