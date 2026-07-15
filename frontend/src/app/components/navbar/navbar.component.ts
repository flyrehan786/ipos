import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  get isSuperAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'super_admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/app/login']);
  }
}
