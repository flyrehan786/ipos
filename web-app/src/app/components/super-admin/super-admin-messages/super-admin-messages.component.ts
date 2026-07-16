import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SuperAdminService } from '../../../services/super-admin.service';
import { ContactMessage } from '../../../models/super-admin.model';

@Component({
  selector: 'app-super-admin-messages',
  templateUrl: './super-admin-messages.component.html'
})
export class SuperAdminMessagesComponent implements OnInit, OnDestroy {
  messages: ContactMessage[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalItems = 0;

  selectedMessage: ContactMessage | null = null;

  constructor(private superAdminService: SuperAdminService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadMessages();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  loadMessages(): void {
    this.loading = true;
    this.superAdminService.getMessages(this.currentPage, this.itemsPerPage, this.searchTerm, this.statusFilter).subscribe({
      next: (res) => {
        this.messages = res.data;
        this.totalPages = res.totalPages;
        this.totalItems = res.total;
        if (this.currentPage > this.totalPages && this.totalPages >= 1) {
          this.currentPage = this.totalPages;
          this.loadMessages();
          return;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadMessages();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadMessages();
    }
  }

  view(message: ContactMessage): void {
    this.selectedMessage = message;
    if (message.status === 'new') {
      this.setStatus(message, 'read');
    }
  }

  closeView(): void {
    this.selectedMessage = null;
  }

  setStatus(message: ContactMessage, status: 'new' | 'read' | 'archived'): void {
    this.superAdminService.updateMessageStatus(message.id, status).subscribe({
      next: () => { message.status = status; }
    });
  }

  deleteMessage(message: ContactMessage): void {
    if (confirm('Delete this message?')) {
      this.superAdminService.deleteMessage(message.id).subscribe({
        next: () => {
          if (this.selectedMessage?.id === message.id) { this.selectedMessage = null; }
          this.loadMessages();
        }
      });
    }
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'read': return 'bg-secondary';
      case 'archived': return 'bg-dark';
      default: return 'bg-light text-dark';
    }
  }
}
