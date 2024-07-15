import { Component, input } from '@angular/core';
import {
  DashboardDataUnit,
  OneValueDashboardElement,
} from '../../models/dashboard/dashboard-mp';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-mp-one-value-dashboard-element',
  standalone: true,
  imports: [MatIconModule, DatePipe, CurrencyPipe],
  templateUrl: './mp-one-value-dashboard-element.component.html',
  styleUrl: './mp-one-value-dashboard-element.component.scss',
})
export class MpOneValueDashboardElementComponent {
  readonly element = input.required<OneValueDashboardElement>();
  readonly DashboardDataUnit = DashboardDataUnit;
}
