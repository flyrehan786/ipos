import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html'
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = true;
  error = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Transaction loading error:', err);
        this.error = 'Failed to load transactions. Please ensure the backend server is running.';
        this.loading = false;
      }
    });
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
