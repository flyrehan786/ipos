export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  tenant_id?: number | null;
  tenant_name?: string;
  created_at?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}
