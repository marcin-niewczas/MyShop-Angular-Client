export enum DashboardElement {
  OneValue = 'OneValue',
  Chart = 'Chart',
  Group = 'Group',
}

export enum DashboardChartType {
  Line = 'line',
  Pie = 'pie',
  Bar = 'bar',
}

export enum DashboardDataUnit {
  None = 'None',
  Date = 'Date',
  Currency = 'Currency',
}

export enum DashboardElementSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

export abstract class BaseDashboardElement {
  readonly dashboardElement!: DashboardElement;
  readonly dashboardDataUnit!: DashboardDataUnit;
  readonly dashboardElementSize!: DashboardElementSize;
  readonly title?: string;
  readonly icon?: string;
}

export class OneValueDashboardElement extends BaseDashboardElement {
  readonly value!: number;
  readonly routerInfo?: RouterInfo;
}

export enum GroupValuesDashboardElementType {
  Statistics = 'Statistics',
  Ranks = 'Ranks',
}

export class GroupValuesDashboardElement extends BaseDashboardElement {
  readonly values!: OneValueDashboardElement[];
  readonly groupValuesDashboardElementType!: GroupValuesDashboardElementType;
}

export class ChartDashboardElement extends BaseDashboardElement {
  readonly dashboardChartType!: DashboardChartType;
  readonly dashboardLabelUnit!: DashboardDataUnit;
  readonly labels!: string[];
  readonly data!: number[];
  readonly backgroundColors!: string[];
  readonly showDataLabels!: boolean;
}

class RouterInfo {
  readonly resourceType?: string;
  readonly resourceId?: string;
}
