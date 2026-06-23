import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit, OnDestroy {
  paginatedUsers: User[] = [];
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  selectedIds = new Set<number>();

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
    this.userService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedUsers = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadUsers();
          return;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.loadUsers();
        }
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
    return this.paginatedUsers.length > 0 &&
      this.paginatedUsers.every(u => this.selectedIds.has(u.id!));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.paginatedUsers.forEach(u => this.selectedIds.delete(u.id!));
    } else {
      this.paginatedUsers.forEach(u => this.selectedIds.add(u.id!));
    }
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    if (confirm(`Delete ${this.selectedIds.size} selected user(s)?`)) {
      this.userService.bulkDelete(Array.from(this.selectedIds)).subscribe({
        next: () => {
          this.loadUsers();
        }
      });
    }
  }

  bulkSetStatus(status: 'active' | 'inactive'): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    this.userService.bulkUpdateStatus(Array.from(this.selectedIds), status).subscribe({
      next: () => {
        this.loadUsers();
      }
    });
  }
}
