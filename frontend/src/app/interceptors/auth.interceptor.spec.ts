import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStub: any;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authStub = {
      token: 'access-old',
      refresh: 'refresh-1',
      getToken() { return this.token; },
      getRefreshToken() { return this.refresh; },
      refreshToken: jasmine.createSpy('refreshToken'),
      logout: jasmine.createSpy('logout')
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('attaches the bearer token to outgoing requests', () => {
    http.get('/api/products').subscribe();
    const req = httpMock.expectOne('/api/products');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-old');
    req.flush({});
  });

  it('refreshes the token on 401 and retries the original request', () => {
    authStub.refreshToken.and.returnValue(of({ token: 'access-new', refreshToken: 'refresh-2' }));

    let result: any;
    http.get('/api/products').subscribe(r => (result = r));

    const first = httpMock.expectOne('/api/products');
    expect(first.request.headers.get('Authorization')).toBe('Bearer access-old');
    first.flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });

    const retry = httpMock.expectOne('/api/products');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-new');
    retry.flush({ ok: true });

    expect(authStub.refreshToken).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('logs out and redirects when the refresh attempt fails', () => {
    authStub.refreshToken.and.returnValue(throwError(() => new Error('refresh failed')));

    http.get('/api/products').subscribe({ next: () => {}, error: () => {} });

    const first = httpMock.expectOne('/api/products');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authStub.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logs out on 403 without attempting a refresh', () => {
    http.get('/api/admin').subscribe({ next: () => {}, error: () => {} });

    const req = httpMock.expectOne('/api/admin');
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(authStub.refreshToken).not.toHaveBeenCalled();
    expect(authStub.logout).toHaveBeenCalled();
  });
});
