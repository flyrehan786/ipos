import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SuperAdminService } from '../../../services/super-admin.service';
import { User } from '../../../models/user.model';
import { Tenant } from '../../../models/super-admin.model';

@Component({
  selector: 'app-super-admin-users',
  templateUrl: './super-admin-users.component.html'
})
export class SuperAdminUsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  tenants: Tenant[] = [];
  loading = true;
  searchTerm = '';
  selectedTenantId: number | null = null;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  selectedIds = new Set<number>();

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.superAdminService.getTenants().subscribe({
      next: (tenants) => { this.tenants = tenants; }
    });
    this.loadUsers();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadUsers(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.superAdminService.getUsers(this.currentPage, this.itemsPerPage, this.searchTerm, this.selectedTenantId).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadUsers();
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

  onTenantFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  toggleStatus(user: User): void {
    const next = user.status === 'active' ? 'inactive' : 'active';
    this.superAdminService.updateUserStatus(user.id!, next).subscribe({
      next: () => { user.status = next; }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.superAdminService.deleteUser(id).subscribe({
        next: () => { this.loadUsers(); }
      });
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  get allSelected(): boolean {
    return this.users.length > 0 && this.users.every(u => this.selectedIds.has(u.id!));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.users.forEach(u => this.selectedIds.delete(u.id!));
    } else {
      this.users.forEach(u => this.selectedIds.add(u.id!));
    }
  }

  bulkSetStatus(status: 'active' | 'inactive'): void {
    if (this.selectedIds.size === 0) { return; }
    this.superAdminService.bulkUpdateUserStatus(Array.from(this.selectedIds), status).subscribe({
      next: () => { this.loadUsers(); }
    });
  }
}
