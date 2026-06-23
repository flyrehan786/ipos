import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getPaginated(page: number, limit: number, search: string = ''): Observable<PaginatedResponse<User>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) { params = params.set('search', search); }
    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  update(id: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  changePassword(id: number, passwordData: { current_password: string, new_password: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/change-password`, passwordData);
  }
}
