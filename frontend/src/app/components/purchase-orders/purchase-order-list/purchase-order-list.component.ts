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
  loading = true;

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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
