import { Component, OnInit, inject, input } from '@angular/core';
import {
  ChartDashboardElement,
  DashboardChartType,
  DashboardDataUnit,
} from '../../models/dashboard/dashboard-mp';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  TooltipItem,
  Chart,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-mp-chart-dashboard-element',
  standalone: true,
  imports: [DatePipe, BaseChartDirective],
  providers: [DatePipe, CurrencyPipe],
  templateUrl: './mp-chart-dashboard-element.component.html',
  styleUrl: './mp-chart-dashboard-element.component.scss',
})
export class MpChartDashboardElementComponent implements OnInit {
  readonly element = input.required<ChartDashboardElement>();
  private readonly _datePipe = inject(DatePipe);
  private readonly _currencyPipe = inject(CurrencyPipe);

  chartType!: keyof ChartTypeRegistry;
  chartData!: ChartData;
  chartOptions!: ChartOptions;

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.configureChart();
  }

  private configureChart() {
    this.chartType = this.element().dashboardChartType;
    switch (this.element().dashboardChartType) {
      case DashboardChartType.Pie:
        this.configureChartPie();
        break;
      case DashboardChartType.Line:
        this.configureChartLine();
        break;
      case DashboardChartType.Bar:
        this.configureChartBar();
        break;
      default:
        throw Error(
          `Not supported chart type '${this.element().dashboardChartType}'.`,
        );
    }
  }

  private configureChartPie() {
    this.chartData = {
      datasets: [
        {
          data: this.element().data,
          borderRadius: 5,
        },
      ],
      labels: this.transformLabel(),
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        datalabels: {
          display: this.element().showDataLabels,
          color: 'rgba(0,0,0)',
          font: { weight: 'bold' },
        },
        legend: {
          display: true,
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: this.getTransformDataCallback(),
          },
        },
      },
      elements: {
        line: {
          tension: 0.5,
        },
      },
    };
  }

  private configureChartLine() {
    this.chartData = {
      datasets: [
        {
          data: this.element().data,
          fill: 'origin',
        },
      ],
      labels: this.transformLabel(),
    } as ChartData<'line'>;

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: this.element().showDataLabels,
          color: 'rgba(0,0,0)',
          font: { weight: 'bold' },
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: this.getTransformDataCallback(),
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { display: false } },
      },
      elements: {
        line: {
          tension: 0.5,
        },
      },
    } as ChartOptions<'line'>;
  }

  private configureChartBar() {
    this.chartData = {
      datasets: [
        {
          data: this.element().data,
          borderRadius: 5,
        },
      ],
      labels: this.transformLabel(),
    } as ChartData<'bar'>;

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: this.element().showDataLabels,
          color: 'rgba(0,0,0)',
          font: { weight: 'bold' },
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: this.getTransformDataCallback(),
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { display: false } },
      },
    } as ChartOptions<'bar'>;
  }

  private transformLabel() {
    switch (this.element().dashboardLabelUnit) {
      case DashboardDataUnit.Currency:
        return this.element().labels.map((value) =>
          this._currencyPipe.transform(value),
        );
      case DashboardDataUnit.Date:
        return this.element().labels.map((value) =>
          this._datePipe.transform(value, 'MMM y'),
        );
      default:
        return this.element().labels;
    }
  }

  private getTransformDataCallback() {
    switch (this.element().dashboardDataUnit) {
      case DashboardDataUnit.Currency:
        return this.currencyTransformCallback;
      case DashboardDataUnit.Date:
        return this.dateTransformCallback;
      default:
        return this.noneTransformCallback;
    }
  }

  private dateTransformCallback = (
    item: TooltipItem<keyof ChartTypeRegistry>,
  ) => {
    return this._datePipe.transform(item.raw as string) as string;
  };

  private noneTransformCallback = (
    item: TooltipItem<keyof ChartTypeRegistry>,
  ) => {
    return item.formattedValue;
  };

  private currencyTransformCallback = (
    item: TooltipItem<keyof ChartTypeRegistry>,
  ) => {
    return this._currencyPipe.transform(item.raw as number) as string;
  };
}
