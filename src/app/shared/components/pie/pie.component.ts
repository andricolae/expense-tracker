import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
};

@Component({
  selector: 'app-pie',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css'],
})
export class PieComponent implements OnChanges {
  @Input() categoryTotals: { category: string; total: number }[] = [];
  @Input() weeklyTotal: number = 0; // dacă vrei să afișezi și totalul

  public chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryTotals']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: this.categoryTotals.map((ct) => ct.total),
      labels: this.categoryTotals.map((ct) => ct.category),
    };
  }
}
