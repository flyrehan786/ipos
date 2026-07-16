import { Component, OnInit, OnDestroy } from '@angular/core';
import { downloadBlob } from '../../../utils/download';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SaleOrderService } from '../../../services/sale-order.service';
import { SaleOrder } from '../../../models/order.model';

@Component({
  selector: 'app-sale-order-list',
  templateUrl: './sale-order-list.component.html'
})
export class SaleOrderListComponent implements OnInit, OnDestroy {
  paginatedOrders: SaleOrder[] = [];
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
    private saleOrderService: SaleOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadOrders();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  exportCsv(): void {
    this.saleOrderService.exportCsv().subscribe({
      next: (blob) => downloadBlob(blob, 'sale-orders.csv'),
      error: () => {}
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.saleOrderService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedOrders = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadOrders();
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
      this.loadOrders();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  viewOrder(id: number): void {
    this.router.navigate(['/app/sale-orders/edit', id]);
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this sale order?')) {
      this.saleOrderService.delete(id).subscribe({
        next: () => {
          this.loadOrders();
        }
      });
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'partial': return 'bg-warning';
      case 'unpaid': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
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
    return this.paginatedOrders.length > 0 &&
      this.paginatedOrders.every(o => this.selectedIds.has(o.id!));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.paginatedOrders.forEach(o => this.selectedIds.delete(o.id!));
    } else {
      this.paginatedOrders.forEach(o => this.selectedIds.add(o.id!));
    }
  }

  bulkSetStatus(status: 'pending' | 'completed' | 'cancelled'): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    this.saleOrderService.bulkUpdateStatus(Array.from(this.selectedIds), status).subscribe({
      next: () => {
        this.loadOrders();
      }
    });
  }
}
