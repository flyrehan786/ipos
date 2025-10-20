import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SaleOrderService } from '../../services/sale-order.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ProductService } from '../../services/product.service';
import { ClientService } from '../../services/client.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {
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

  // Chart data
  salesChart: Chart | null = null;
  purchaseChart: Chart | null = null;
  salesFilter = 'week';
  purchaseFilter = 'week';
  salesCustomStart = '';
  salesCustomEnd = '';
  purchaseCustomStart = '';
  purchaseCustomEnd = '';
  topSellingProducts: any[] = [];
  allSaleOrders: any[] = [];
  allPurchaseOrders: any[] = [];

  constructor(
    private saleOrderService: SaleOrderService,
    private purchaseOrderService: PurchaseOrderService,
    private productService: ProductService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  loadStats(): void {
    this.saleOrderService.getAll().subscribe({
      next: (orders) => {
        this.allSaleOrders = orders;
        this.stats.totalSales = orders.filter(o => o.status === 'completed').length;
        this.loadTopSellingProducts();
        this.createSalesChart();
      }
    });

    this.purchaseOrderService.getAll().subscribe({
      next: (orders) => {
        this.allPurchaseOrders = orders;
        this.stats.totalPurchases = orders.filter(o => o.status === 'completed').length;
        this.createPurchaseChart();
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

  initializeCharts(): void {
    this.createSalesChart();
    this.createPurchaseChart();
  }

  createSalesChart(): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const data = this.getSalesChartData();
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Sales',
          data: data.values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 100;
            }
            return delay;
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.x || 0;
                return 'Amount: ' + value.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    };

    this.salesChart = new Chart(canvas, config);
  }

  createPurchaseChart(): void {
    const canvas = document.getElementById('purchaseChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.purchaseChart) {
      this.purchaseChart.destroy();
    }

    const data = this.getPurchaseChartData();
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Purchases',
          data: data.values,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 100;
            }
            return delay;
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.x || 0;
                return 'Amount: ' + value.toFixed(2);
              }
            }
          }
        },
        scales: {
          x: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    };

    this.purchaseChart = new Chart(canvas, config);
  }

  getSalesChartData(): { labels: string[], values: number[] } {
    const filteredOrders = this.filterOrders(this.allSaleOrders, this.salesFilter, this.salesCustomStart, this.salesCustomEnd);
    return this.aggregateOrderData(filteredOrders, this.salesFilter);
  }

  getPurchaseChartData(): { labels: string[], values: number[] } {
    const filteredOrders = this.filterOrders(this.allPurchaseOrders, this.purchaseFilter, this.purchaseCustomStart, this.purchaseCustomEnd);
    return this.aggregateOrderData(filteredOrders, this.purchaseFilter);
  }

  filterOrders(orders: any[], filter: string, customStart: string, customEnd: string): any[] {
    const now = new Date();
    let startDate: Date;

    if (filter === 'custom' && customStart && customEnd) {
      return orders.filter(o => {
        const orderDate = new Date(o.order_date);
        return orderDate >= new Date(customStart) && orderDate <= new Date(customEnd);
      });
    }

    switch (filter) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    return orders.filter(o => new Date(o.order_date) >= startDate);
  }

  aggregateOrderData(orders: any[], filter: string): { labels: string[], values: number[] } {
    const grouped: { [key: string]: number } = {};

    orders.forEach(order => {
      const date = new Date(order.order_date);
      let key: string;

      if (filter === 'day' || filter === 'custom') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (filter === 'week') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      grouped[key] = (grouped[key] || 0) + parseFloat(order.total_amount || 0);
    });

    const labels = Object.keys(grouped).slice(-10);
    const values = labels.map(label => grouped[label]);

    return { labels, values };
  }

  onSalesFilterChange(event: any): void {
    this.salesFilter = event.target.value;
    this.createSalesChart();
  }

  onPurchaseFilterChange(event: any): void {
    this.purchaseFilter = event.target.value;
    this.createPurchaseChart();
  }

  loadTopSellingProducts(): void {
    // Calculate top selling products from sale orders
    const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

    this.allSaleOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const key = item.product_id || item.product_name;
          if (!productSales[key]) {
            productSales[key] = { name: item.product_name, quantity: 0, revenue: 0 };
          }
          productSales[key].quantity += item.quantity;
          productSales[key].revenue += item.total;
        });
      }
    });

    this.topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }
}
