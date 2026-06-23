import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder } from '../../../models/order.model';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html'
})
export class PurchaseOrderListComponent implements OnInit {
  paginatedOrders: PurchaseOrder[] = [];
  loading = true;
  searchTerm = '';

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.purchaseOrderService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
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
    this.currentPage = 1;
    this.loadOrders();
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
    this.router.navigate(['/purchase-orders/edit', id]);
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      this.purchaseOrderService.delete(id).subscribe({
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
}
