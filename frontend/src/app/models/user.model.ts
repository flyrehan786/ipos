export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  created_at?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
