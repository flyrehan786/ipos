import { Component, OnInit, OnDestroy } from '@angular/core';
import { downloadBlob } from '../../../utils/download';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent implements OnInit, OnDestroy {
  paginatedSuppliers: Supplier[] = [];
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  selectedIds = new Set<number>();

  constructor(
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadSuppliers();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  exportCsv(): void {
    this.supplierService.exportCsv().subscribe({
      next: (blob) => downloadBlob(blob, 'suppliers.csv'),
      error: () => {}
    });
  }

  loadSuppliers(): void {
    this.loading = true;
    this.selectedIds.clear();
    this.supplierService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedSuppliers = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadSuppliers();
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
      this.loadSuppliers();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get allSelected(): boolean {
    return this.paginatedSuppliers.length > 0 &&
      this.paginatedSuppliers.every(s => this.selectedIds.has(s.id!));
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

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.paginatedSuppliers.forEach(s => this.selectedIds.delete(s.id!));
    } else {
      this.paginatedSuppliers.forEach(s => this.selectedIds.add(s.id!));
    }
  }

  editSupplier(id: number): void {
    this.router.navigate(['/app/suppliers/edit', id]);
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).subscribe({
        next: () => this.loadSuppliers()
      });
    }
  }

  bulkDelete(): void {
    if (!confirm(`Delete ${this.selectedIds.size} supplier(s)?`)) return;
    this.supplierService.bulkDelete([...this.selectedIds]).subscribe({
      next: () => {
        this.selectedIds.clear();
        this.loadSuppliers();
      }
    });
  }

  bulkSetStatus(status: 'active' | 'inactive'): void {
    this.supplierService.bulkUpdateStatus([...this.selectedIds], status).subscribe({
      next: () => {
        this.selectedIds.clear();
        this.loadSuppliers();
      }
    });
  }
}
