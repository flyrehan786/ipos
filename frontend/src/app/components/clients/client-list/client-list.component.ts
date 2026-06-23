import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  paginatedClients: Client[] = [];
  loading = true;
  searchTerm = '';

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedClients = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadClients();
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
    this.loadClients();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  editClient(id: number): void {
    this.router.navigate(['/clients/edit', id]);
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.delete(id).subscribe({
        next: () => {
          this.loadClients();
        }
      });
    }
  }
}
