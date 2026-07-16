import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuditLogService } from '../../../services/audit-log.service';
import { AuditLog } from '../../../models/audit-log.model';

@Component({
  selector: 'app-audit-log-list',
  templateUrl: './audit-log-list.component.html'
})
export class AuditLogListComponent implements OnInit, OnDestroy {
  logs: AuditLog[] = [];
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;
  totalItems = 0;

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadLogs();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadLogs();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadLogs(): void {
    this.loading = true;
    this.auditLogService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.logs = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadLogs();
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
      this.loadLogs();
    }
  }

  getActionClass(action: string): string {
    if (action.startsWith('bulk')) { return 'bg-info'; }
    switch (action) {
      case 'create': return 'bg-success';
      case 'delete': return 'bg-danger';
      case 'update': return 'bg-warning';
      case 'login': return 'bg-secondary';
      default: return 'bg-light text-dark border';
    }
  }
}
