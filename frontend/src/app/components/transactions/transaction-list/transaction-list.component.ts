import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html'
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.filteredTransactions = data;
        this.updatePagination();
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
    if (!this.searchTerm) {
      this.filteredTransactions = this.transactions;
    } else {
      this.filteredTransactions = this.transactions.filter(transaction =>
        transaction.transaction_type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.payment_method.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.reference_type?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);
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

  getTypeClass(type: string): string {
    return type === 'income' ? 'bg-success' : 'bg-danger';
  }

  getTotalIncome(): number {
    if (!this.transactions || this.transactions.length === 0) {
      return 0;
    }
    return this.transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }

  getTotalExpense(): number {
    if (!this.transactions || this.transactions.length === 0) {
      return 0;
    }
    return this.transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }

  getNetBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }
}
