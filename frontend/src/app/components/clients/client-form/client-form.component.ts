import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = false;
  clientId?: number;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      city: [''],
      country: [''],
      tax_id: [''],
      credit_limit: [0, [Validators.min(0)]],
      status: ['active', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clientId = +params['id'];
        this.loadClient();
      }
    });
  }

  loadClient(): void {
    this.clientService.getById(this.clientId!).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const request = this.isEditMode
      ? this.clientService.update(this.clientId!, this.clientForm.value)
      : this.clientService.create(this.clientForm.value);

    request.subscribe({
      next: () => {
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        this.error = error.error?.error || 'An error occurred';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}
