import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const allowedRoles = (route.data?.['roles'] as string[]) || [];
    const userRole = this.authService.currentUserValue?.role;

    if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
      return true;
    }

    // Authenticated but not authorized for this route.
    this.router.navigate(['/dashboard']);
    return false;
  }
}
