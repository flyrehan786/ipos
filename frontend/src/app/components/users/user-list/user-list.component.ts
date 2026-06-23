import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  paginatedUsers: User[] = [];
  loading = true;
  searchTerm = '';

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
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
    this.currentPage = 1;
    this.loadUsers();
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
}
