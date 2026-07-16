import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authStub: any;
  let routerSpy: jasmine.SpyObj<Router>;
  const state = { url: '/users' } as RouterStateSnapshot;

  function makeRoute(roles?: string[]): ActivatedRouteSnapshot {
    return { data: roles ? { roles } : {} } as any;
  }

  beforeEach(() => {
    authStub = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      currentUserValue: null as any
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy }
      ]
    });
    guard = TestBed.inject(RoleGuard);
  });

  it('redirects to login when the user is not authenticated', () => {
    authStub.isLoggedIn.and.returnValue(false);
    expect(guard.canActivate(makeRoute(['admin']), state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
  });

  it('allows an authenticated user whose role is permitted', () => {
    authStub.currentUserValue = { role: 'admin' };
    expect(guard.canActivate(makeRoute(['admin']), state)).toBeTrue();
  });

  it('blocks an authenticated user whose role is not permitted', () => {
    authStub.currentUserValue = { role: 'cashier' };
    expect(guard.canActivate(makeRoute(['admin']), state)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('allows access when the route declares no role restriction', () => {
    authStub.currentUserValue = { role: 'cashier' };
    expect(guard.canActivate(makeRoute(), state)).toBeTrue();
  });
});
