import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrls: ['./website.component.css']
})
export class WebsiteComponent implements OnInit {
  year = new Date().getFullYear();

  contact = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  submitting = false;
  submitSuccess = '';
  submitError = '';

  features = [
    {
      icon: 'bi-box-seam',
      title: 'Inventory Management',
      text: 'Track products, stock levels and low-stock alerts in real time with barcode support.'
    },
    {
      icon: 'bi-cart-check',
      title: 'Sales & Purchases',
      text: 'Create sale and purchase orders, manage payments and keep every transaction in order.'
    },
    {
      icon: 'bi-people',
      title: 'Client Management',
      text: 'Maintain client records, credit limits and balances all in one organized place.'
    },
    {
      icon: 'bi-bar-chart-line',
      title: 'Insightful Reports',
      text: 'Beautiful dashboards and charts give you a clear view of revenue, spend and trends.'
    },
    {
      icon: 'bi-building',
      title: 'Multi-Tenant',
      text: 'Run multiple organizations from a single platform with isolated, secure data.'
    },
    {
      icon: 'bi-shield-lock',
      title: 'Role-Based Access',
      text: 'Admins manage everything; staff get exactly the access they need — nothing more.'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    // Logged-in users should land in the app, not the marketing site.
    if (this.authService.isLoggedIn()) {
      const role = this.authService.currentUserValue?.role;
      this.router.navigate([role === 'super_admin' ? '/super-admin' : '/dashboard']);
    }
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitContact(): void {
    this.submitSuccess = '';
    this.submitError = '';

    if (!this.contact.name.trim() || !this.contact.email.trim() || !this.contact.message.trim()) {
      this.submitError = 'Please fill in your name, email and message.';
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(this.contact.email.trim())) {
      this.submitError = 'Please enter a valid email address.';
      return;
    }

    this.submitting = true;
    this.contactService.submit({
      name: this.contact.name.trim(),
      email: this.contact.email.trim(),
      subject: this.contact.subject.trim() || undefined,
      message: this.contact.message.trim()
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitSuccess = res?.message || 'Your message has been received. We will get back to you soon.';
        this.contact = { name: '', email: '', subject: '', message: '' };
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.error || 'Something went wrong. Please try again.';
      }
    });
  }
}
