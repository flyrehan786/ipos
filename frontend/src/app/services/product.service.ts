import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number, search: string = ''): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/barcode/${barcode}`);
  }

  search(term: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${term}`);
  }

  getLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  create(product: Product): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  update(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
