import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  bulkDelete(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-delete`, { ids });
  }

  bulkUpdateStatus(ids: number[], status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-status`, { ids, status });
  }

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number, search: string = ''): Observable<PaginatedResponse<Supplier>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<Supplier>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  search(term: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/search?q=${encodeURIComponent(term)}`);
  }

  create(supplier: Supplier): Observable<any> {
    return this.http.post(this.apiUrl, supplier);
  }

  update(id: number, supplier: Supplier): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, supplier);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
