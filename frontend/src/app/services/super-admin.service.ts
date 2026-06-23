import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { User } from '../models/user.model';
import { Tenant, PlatformStats, ContactMessage } from '../models/super-admin.model';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = `${environment.apiUrl}/super-admin`;

  constructor(private http: HttpClient) {}

  // ----- Stats -----
  getStats(tenantId?: number | null): Observable<PlatformStats> {
    let params = new HttpParams();
    if (tenantId) { params = params.set('tenantId', tenantId); }
    return this.http.get<PlatformStats>(`${this.apiUrl}/stats`, { params });
  }

  // ----- Tenants -----
  getTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`);
  }

  getTenantsPaginated(page: number, limit: number, search = ''): Observable<PaginatedResponse<Tenant>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<Tenant>>(`${this.apiUrl}/tenants`, { params });
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/tenants/${id}`);
  }

  createTenant(payload: {
    name: string;
    admin_username?: string;
    admin_email?: string;
    admin_password?: string;
    admin_full_name?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/tenants`, payload);
  }

  updateTenant(id: number, payload: { name: string; status?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/tenants/${id}`, payload);
  }

  updateTenantStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/tenants/${id}/status`, { status });
  }

  // ----- Users (cross-tenant) -----
  getUsers(page: number, limit: number, search = '', tenantId?: number | null): Observable<PaginatedResponse<User>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    if (tenantId) { params = params.set('tenantId', tenantId); }
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params });
  }

  updateUserStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  bulkUpdateUserStatus(ids: number[], status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/bulk-status`, { ids, status });
  }

  // ----- Contact messages -----
  getMessages(page: number, limit: number, search = '', status = ''): Observable<PaginatedResponse<ContactMessage>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    if (status) { params = params.set('status', status); }
    return this.http.get<PaginatedResponse<ContactMessage>>(`${this.apiUrl}/contact-messages`, { params });
  }

  updateMessageStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/contact-messages/${id}/status`, { status });
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contact-messages/${id}`);
  }
}
