import { Component, OnInit, OnDestroy } from '@angular/core';
import { downloadBlob } from '../../../utils/download';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit, OnDestroy {
  paginatedClients: Client[] = [];
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
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadClients();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  exportCsv(): void {
    this.clientService.exportCsv().subscribe({
      next: (blob) => downloadBlob(blob, 'clients.csv'),
      error: () => {}
    });
  }

  loadClients(): void {
    this.loading = true;
    this.selectedIds.clear();
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
    this.searchSubject.next(this.searchTerm);
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
    return this.paginatedClients.length > 0 &&
      this.paginatedClients.every(c => this.selectedIds.has(c.id!));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.paginatedClients.forEach(c => this.selectedIds.delete(c.id!));
    } else {
      this.paginatedClients.forEach(c => this.selectedIds.add(c.id!));
    }
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    if (confirm(`Delete ${this.selectedIds.size} selected client(s)?`)) {
      this.clientService.bulkDelete(Array.from(this.selectedIds)).subscribe({
        next: () => {
          this.loadClients();
        }
      });
    }
  }

  bulkSetStatus(status: 'active' | 'inactive'): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    this.clientService.bulkUpdateStatus(Array.from(this.selectedIds), status).subscribe({
      next: () => {
        this.loadClients();
      }
    });
  }
}
