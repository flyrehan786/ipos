import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder } from '../../../models/order.model';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html'
})
export class PurchaseOrderListComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  paginatedOrders: PurchaseOrder[] = [];
  loading = true;
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.purchaseOrderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
        this.updatePagination();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order =>
        order.order_number.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.supplier_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.payment_status.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
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
