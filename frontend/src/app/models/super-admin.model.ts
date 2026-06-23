export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface PerTenantStat {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  users: number;
  products: number;
  clients: number;
  revenue: number;
  spend: number;
}

export interface PlatformStats {
  tenants: { total: number; active: number };
  users: number;
  clients: number;
  products: number;
  saleOrders: { count: number; revenue: number };
  purchaseOrders: { count: number; spend: number };
  transactions: { income: number; expense: number; net: number };
  newMessages: number;
  perTenant: PerTenantStat[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at?: string;
}
