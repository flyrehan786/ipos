import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SuperAdminService } from '../../../services/super-admin.service';
import { Tenant } from '../../../models/super-admin.model';

@Component({
  selector: 'app-super-admin-tenants',
  templateUrl: './super-admin-tenants.component.html'
})
export class SuperAdminTenantsComponent implements OnInit, OnDestroy {
  tenants: Tenant[] = [];
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  // Form modal state
  showForm = false;
  editingId: number | null = null;
  saving = false;
  formError = '';
  form = {
    name: '',
    status: 'active' as 'active' | 'inactive',
    admin_username: '',
    admin_email: '',
    admin_full_name: '',
    admin_password: ''
  };

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.loadTenants();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTenants();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadTenants(): void {
    this.loading = true;
    this.superAdminService.getTenantsPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.tenants = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadTenants();
          return;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTenants();
    }
  }

  openCreate(): void {
    this.editingId = null;
    this.formError = '';
    this.form = {
      name: '',
      status: 'active',
      admin_username: '',
      admin_email: '',
      admin_full_name: '',
      admin_password: ''
    };
    this.showForm = true;
  }

  openEdit(tenant: Tenant): void {
    this.editingId = tenant.id;
    this.formError = '';
    this.form = {
      name: tenant.name,
      status: tenant.status,
      admin_username: '',
      admin_email: '',
      admin_full_name: '',
      admin_password: ''
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.formError = 'Organization name is required';
      return;
    }
    this.saving = true;
    this.formError = '';

    if (this.editingId) {
      this.superAdminService.updateTenant(this.editingId, {
        name: this.form.name.trim(),
        status: this.form.status
      }).subscribe({
        next: () => { this.saving = false; this.showForm = false; this.loadTenants(); },
        error: (err) => { this.saving = false; this.formError = err?.error?.error || 'Failed to update tenant'; }
      });
    } else {
      const payload: any = { name: this.form.name.trim() };
      // Optional initial admin provisioning.
      if (this.form.admin_username && this.form.admin_email && this.form.admin_full_name && this.form.admin_password) {
        payload.admin_username = this.form.admin_username.trim();
        payload.admin_email = this.form.admin_email.trim();
        payload.admin_full_name = this.form.admin_full_name.trim();
        payload.admin_password = this.form.admin_password;
      }
      this.superAdminService.createTenant(payload).subscribe({
        next: () => { this.saving = false; this.showForm = false; this.loadTenants(); },
        error: (err) => { this.saving = false; this.formError = err?.error?.error || 'Failed to create tenant'; }
      });
    }
  }

  toggleStatus(tenant: Tenant): void {
    const next = tenant.status === 'active' ? 'inactive' : 'active';
    this.superAdminService.updateTenantStatus(tenant.id, next).subscribe({
      next: () => { tenant.status = next; }
    });
  }
}
