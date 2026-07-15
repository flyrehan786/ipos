import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.currentUserValue?.role;
      this.router.navigate([role === 'super_admin' ? '/app/super-admin' : '/app/dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';

    if (this.route.snapshot.queryParams['registered']) {
      this.success = 'Account created successfully. Please sign in.';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const role = this.authService.currentUserValue?.role;
        if (role === 'super_admin' && this.returnUrl === '/app/dashboard') {
          this.router.navigate(['/app/super-admin']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        this.error = error.error?.error || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
