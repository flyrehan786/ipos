import { Component, OnInit, OnDestroy } from '@angular/core';
import { downloadBlob } from '../../../utils/download';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit, OnDestroy {
  paginatedProducts: Product[] = [];
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
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  exportCsv(): void {
    this.productService.exportCsv().subscribe({
      next: (blob) => downloadBlob(blob, 'products.csv'),
      error: () => {}
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.productService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedProducts = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadProducts();
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
      this.loadProducts();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  editProduct(id: number): void {
    this.router.navigate(['/app/products/edit', id]);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
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
    return this.paginatedProducts.length > 0 &&
      this.paginatedProducts.every(p => this.selectedIds.has(p.id!));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.paginatedProducts.forEach(p => this.selectedIds.delete(p.id!));
    } else {
      this.paginatedProducts.forEach(p => this.selectedIds.add(p.id!));
    }
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    if (confirm(`Delete ${this.selectedIds.size} selected product(s)?`)) {
      this.productService.bulkDelete(Array.from(this.selectedIds)).subscribe({
        next: () => {
          this.loadProducts();
        }
      });
    }
  }

  bulkSetStatus(status: 'active' | 'inactive'): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    this.productService.bulkUpdateStatus(Array.from(this.selectedIds), status).subscribe({
      next: () => {
        this.loadProducts();
      }
    });
  }

  isLowStock(product: Product): boolean {
    return product.stock_quantity <= product.min_stock_level;
  }
}
