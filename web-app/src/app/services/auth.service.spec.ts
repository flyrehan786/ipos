import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores token, refreshToken and user on login', () => {
    const mockUser = {
      id: 1, username: 'admin', email: 'a@b.com',
      full_name: 'Admin', role: 'admin', status: 'active'
    } as any;

    service.login({ username: 'admin', password: 'pw' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'access-1', refreshToken: 'refresh-1', user: mockUser });

    expect(service.getToken()).toBe('access-1');
    expect(service.getRefreshToken()).toBe('refresh-1');
    expect(service.currentUserValue?.username).toBe('admin');
  });

  it('clears the stored session on logout', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('refreshToken', 'r');
    localStorage.setItem('currentUser', JSON.stringify({ username: 'x' }));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });

  it('exchanges the refresh token and stores the new tokens', () => {
    localStorage.setItem('refreshToken', 'old-refresh');

    service.refreshToken().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.refreshToken).toBe('old-refresh');
    req.flush({ token: 'access-2', refreshToken: 'refresh-2' });

    expect(service.getToken()).toBe('access-2');
    expect(service.getRefreshToken()).toBe('refresh-2');
  });

  it('reports logged-in state based on token presence', () => {
    expect(service.isLoggedIn()).toBeFalse();
    localStorage.setItem('token', 'abc');
    expect(service.isLoggedIn()).toBeTrue();
  });
});
