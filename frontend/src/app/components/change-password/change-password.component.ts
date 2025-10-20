import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      // Check if passwords match
      if (this.passwordForm.value.new_password !== this.passwordForm.value.confirm_password) {
        this.error = 'Passwords do not match';
        this.loading = false;
        return;
      }

      const currentUser = this.authService.currentUserValue;
      if (!currentUser || !currentUser.id) {
        this.error = 'User not found';
        this.loading = false;
        return;
      }

      const passwordData = {
        current_password: this.passwordForm.value.current_password,
        new_password: this.passwordForm.value.new_password
      };

      this.userService.changePassword(currentUser.id, passwordData).subscribe({
        next: () => {
          this.success = 'Password changed successfully! Redirecting to login...';
          this.loading = false;
          this.passwordForm.reset();
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to change password';
          this.loading = false;
        }
      });
    }
  }
}
