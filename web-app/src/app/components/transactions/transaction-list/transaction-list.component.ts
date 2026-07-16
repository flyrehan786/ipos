import { Component, OnInit, OnDestroy } from '@angular/core';
import { downloadBlob } from '../../../utils/download';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';
import { TransactionSummary } from '../../../models/pagination.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit, OnDestroy {
  paginatedTransactions: Transaction[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Pagination (server-side)
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  summary: TransactionSummary = { total_income: 0, total_expense: 0, net_balance: 0, total_count: 0 };

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTransactions();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  exportCsv(): void {
    this.transactionService.exportCsv().subscribe({
      next: (blob) => downloadBlob(blob, 'transactions.csv'),
      error: () => {}
    });
  }

  loadSummary(): void {
    this.transactionService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: () => {}
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getPaginated(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        this.paginatedTransactions = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadTransactions();
          return;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Transaction loading error:', err);
        this.error = 'Failed to load transactions. Please ensure the backend server is running.';
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
      this.loadTransactions();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getTypeClass(type: string): string {
    return type === 'income' ? 'bg-success' : 'bg-danger';
  }

  getTotalIncome(): number {
    return this.summary.total_income;
  }

  getTotalExpense(): number {
    return this.summary.total_expense;
  }

  getNetBalance(): number {
    return this.summary.net_balance;
  }
}
