import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { AccessService } from '../../../services/access.service';
import { ChartConfiguration } from 'chart.js';
import { AccessData } from '../../../models/dashboard.model';

@Component({
  selector: 'app-access-pie-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './access-pie-dashboard.component.html',
  styleUrl: './access-pie-dashboard.component.css',
})
export class AccessPieDashboardComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  dateFrom: string = '';
  dateUntil: string = '';

  legendItems: Array<{ day: string; percentage: number; color: string }> = [];

  private colors: string[] = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
  ];

  chartData: ChartConfiguration<'pie'>['data'] = {
    datasets: [
      {
        data: [],
        backgroundColor: this.colors,
      },
    ],
    labels: [],
  };

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset.data;
            const total = dataset.reduce(
              (acc, curr) => acc + (typeof curr === 'number' ? curr : 0),
              0
            );
            const percentage = ((value * 100) / total).toFixed(1);
            return `${label}: ${percentage}% (${value} accesos)`;
          },
        },
      },
    },
  };

  constructor(private dashboardService: AccessService) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    this.dateUntil = today.toISOString().split('T')[0];
    this.filterData();
  }

  filterData() {
    if (this.dateFrom && this.dateUntil) {
      this.dashboardService
        .getWeeklyAccesses(this.dateFrom, this.dateUntil)
        .subscribe((data) => {
          this.updateChartData(data);
        });
    }
  }

  resetFilters() {
    this.loadInitialData();
  }

  private updateChartData(data: AccessData[]) {
    this.chartData.labels = data.map((item) => item.key);

    if (this.chartData.datasets) {
      const numericData = data.map((item) => item.value);
      this.chartData.datasets[0].data = numericData;

      // Calcular porcentajes para la leyenda
      const total = numericData.reduce((acc, curr) => acc + curr, 0);

      this.legendItems = data.map((item, index) => ({
        day: item.key,
        percentage: Number(((item.value * 100) / total).toFixed(1)),
        color: this.colors[index],
      }));
    }

    this.chart.update();
  }
}