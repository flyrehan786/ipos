import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleOrderService } from '../../../services/sale-order.service';
import { SaleOrder } from '../../../models/order.model';

@Component({
  selector: 'app-sale-order-list',
  templateUrl: './sale-order-list.component.html'
})
export class SaleOrderListComponent implements OnInit {
  orders: SaleOrder[] = [];
  loading = true;

  constructor(
    private saleOrderService: SaleOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.saleOrderService.getAll().subscribe({
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
    this.router.navigate(['/sale-orders/edit', id]);
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
}
