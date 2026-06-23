import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder } from '../models/order.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = `${environment.apiUrl}/purchase-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number, search: string = ''): Observable<PaginatedResponse<PurchaseOrder>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<PurchaseOrder>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  getByDateRange(startDate: string, endDate: string): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  create(order: PurchaseOrder): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  update(id: number, order: PurchaseOrder): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order);
  }

  addPayment(id: number, amount: number, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/payment`, { amount, payment_method: paymentMethod });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
