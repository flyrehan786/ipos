import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar>
    <div [class.container-fluid]="authService.isLoggedIn()" [class.mt-4]="authService.isLoggedIn()">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  constructor(public authService: AuthService, private themeService: ThemeService) {
    this.themeService.init();
  }
}
