import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  error = '';
  success = '';
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      username: [{value: '', disabled: true}],
      email: ['', [Validators.required, Validators.email]],
      full_name: ['', Validators.required],
      role: [{value: '', disabled: true}],
      status: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser && this.currentUser.id) {
      this.userService.getById(this.currentUser.id).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: user.status
          });
        },
        error: (err) => {
          this.error = 'Failed to load profile';
        }
      });
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadProfile();
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser && this.currentUser.id) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const updateData: any = {
        username: this.profileForm.get('username')?.value,
        email: this.profileForm.value.email,
        full_name: this.profileForm.value.full_name,
        role: this.profileForm.get('role')?.value,
        status: this.profileForm.get('status')?.value
      };

      this.userService.update(this.currentUser.id, updateData).subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
          this.loading = false;
          this.editMode = false;
          this.loadProfile();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update profile';
          this.loading = false;
        }
      });
    }
  }
}
