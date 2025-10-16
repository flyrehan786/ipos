import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId?: number;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
      }
      this.initForm();
      if (this.isEditMode) {
        this.loadUser();
      }
    });
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      full_name: ['', Validators.required],
      role: ['cashier', Validators.required],
      status: ['active', Validators.required]
    });
  }

  loadUser(): void {
    this.userService.getById(this.userId!).subscribe({
      next: (user) => {
        this.userForm.patchValue(user);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const userData = { ...this.userForm.value };
    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }

    const request = this.isEditMode
      ? this.userService.update(this.userId!, userData)
      : this.userService.create(userData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.error = error.error?.error || 'An error occurred';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
