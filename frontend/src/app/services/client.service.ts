import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number, search: string = ''): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<Client>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  search(term: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/search?q=${term}`);
  }

  create(client: Client): Observable<any> {
    return this.http.post(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
