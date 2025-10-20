import { Component, OnInit } from '@angular/core';
import { SaleOrderService } from '../../services/sale-order.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ProductService } from '../../services/product.service';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalSales: 0,
    totalPurchases: 0,
    totalProducts: 0,
    totalClients: 0,
    lowStockProducts: 0
  };
  lowStockProductsList: any[] = [];
  paginatedLowStock: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  loading = true;

  constructor(
    private saleOrderService: SaleOrderService,
    private purchaseOrderService: PurchaseOrderService,
    private productService: ProductService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.saleOrderService.getAll().subscribe({
      next: (orders) => {
        this.stats.totalSales = orders.filter(o => o.status === 'completed').length;
      }
    });

    this.purchaseOrderService.getAll().subscribe({
      next: (orders) => {
        this.stats.totalPurchases = orders.filter(o => o.status === 'completed').length;
      }
    });

    this.productService.getAll().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
        this.loading = false;
      }
    });

    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.stats.totalClients = clients.length;
      }
    });

    this.productService.getLowStock().subscribe({
      next: (products) => {
        this.stats.lowStockProducts = products.length;
        this.lowStockProductsList = products;
        this.updatePagination();
      },
      error: (err) => {
        console.error('Error loading low stock products:', err);
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.lowStockProductsList.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLowStock = this.lowStockProductsList.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
}
