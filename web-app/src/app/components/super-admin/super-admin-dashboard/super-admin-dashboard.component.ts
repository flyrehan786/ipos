import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { SuperAdminService } from '../../../services/super-admin.service';
import { ThemeService } from '../../../services/theme.service';
import { PlatformStats, Tenant } from '../../../models/super-admin.model';

Chart.register(...registerables);

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  stats: PlatformStats | null = null;
  tenants: Tenant[] = [];
  selectedTenantId: number | null = null;
  loading = true;

  private revenueChart: Chart | null = null;
  private spendChart: Chart | null = null;
  private themeSub?: Subscription;

  constructor(
    private superAdminService: SuperAdminService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.superAdminService.getTenants().subscribe({
      next: (tenants) => { this.tenants = tenants; }
    });
    this.loadStats();
    this.themeSub = this.themeService.theme$.subscribe(() => {
      this.renderCharts();
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    this.revenueChart?.destroy();
    this.spendChart?.destroy();
  }

  onTenantFilterChange(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.superAdminService.getStats(this.selectedTenantId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => { this.loading = false; }
    });
  }

  private getChartTickColor(): string {
    return this.themeService.isDark ? 'rgba(233, 236, 239, 0.85)' : 'rgba(73, 80, 87, 0.9)';
  }

  private getChartGridColor(): string {
    return this.themeService.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  }

  private renderCharts(): void {
    if (!this.stats) { return; }
    const labels = this.stats.perTenant.map(t => t.name);
    this.revenueChart = this.buildBarChart(
      'superAdminRevenueChart',
      this.revenueChart,
      'Revenue',
      labels,
      this.stats.perTenant.map(t => t.revenue),
      'rgba(54, 162, 235, 0.6)',
      'rgba(54, 162, 235, 1)'
    );
    this.spendChart = this.buildBarChart(
      'superAdminSpendChart',
      this.spendChart,
      'Spend',
      labels,
      this.stats.perTenant.map(t => t.spend),
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 159, 64, 1)'
    );
  }

  private buildBarChart(
    canvasId: string,
    existing: Chart | null,
    label: string,
    labels: string[],
    values: number[],
    bg: string,
    border: string
  ): Chart | null {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) { return existing; }
    if (existing) { existing.destroy(); }

    const tick = this.getChartTickColor();
    const grid = this.getChartGridColor();

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
          easing: 'easeOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 200;
            }
            return delay;
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => 'Amount: ' + (context.parsed.x || 0).toFixed(2)
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: tick, callback: (value) => value.toLocaleString() },
            grid: { color: grid }
          },
          y: {
            ticks: { color: tick },
            grid: { color: grid }
          }
        }
      }
    };

    return new Chart(canvas, config);
  }
}
