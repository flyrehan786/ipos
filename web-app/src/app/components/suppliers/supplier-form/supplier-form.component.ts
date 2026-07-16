import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html'
})
export class SupplierFormComponent implements OnInit {
  supplierForm!: FormGroup;
  isEditMode = false;
  supplierId?: number;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.supplierForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      city: [''],
      country: [''],
      tax_id: [''],
      notes: [''],
      status: ['active', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.supplierId = +params['id'];
        this.loadSupplier();
      }
    });
  }

  loadSupplier(): void {
    this.supplierService.getById(this.supplierId!).subscribe({
      next: (supplier) => {
        this.supplierForm.patchValue(supplier);
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const data = this.supplierForm.value;

    if (this.isEditMode) {
      this.supplierService.update(this.supplierId!, data).subscribe({
        next: () => this.router.navigate(['/app/suppliers']),
        error: (err) => {
          this.error = err.error?.error || 'Failed to update supplier';
          this.loading = false;
        }
      });
    } else {
      this.supplierService.create(data).subscribe({
        next: () => this.router.navigate(['/app/suppliers']),
        error: (err) => {
          this.error = err.error?.error || 'Failed to create supplier';
          this.loading = false;
        }
      });
    }
  }
}
