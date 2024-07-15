import { Component, input } from '@angular/core';
import {
  GroupValuesDashboardElement,
  GroupValuesDashboardElementType,
} from '../../models/dashboard/dashboard-mp';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MpOneValueDashboardElementComponent } from '../mp-one-value-dashboard-element/mp-one-value-dashboard-element.component';

@Component({
  selector: 'app-mp-group-dashboard-element',
  standalone: true,
  imports: [
    MpOneValueDashboardElementComponent,
    MatDividerModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './mp-group-dashboard-element.component.html',
  styleUrl: './mp-group-dashboard-element.component.scss',
})
export class MpGroupDashboardElementComponent {
  readonly element = input.required<GroupValuesDashboardElement>();

  readonly GroupValuesDashboardElementType = GroupValuesDashboardElementType;
}
