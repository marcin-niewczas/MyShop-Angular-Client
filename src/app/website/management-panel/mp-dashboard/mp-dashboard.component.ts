import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { DashboardMpService } from '../services/dashboard-mp.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BaseDashboardElement,
  ChartDashboardElement,
  DashboardElement,
  DashboardElementSize,
  GroupValuesDashboardElement,
  OneValueDashboardElement,
} from '../models/dashboard/dashboard-mp';
import { NgClass, ViewportScroller } from '@angular/common';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { BehaviorSubject, filter, switchMap, take, tap } from 'rxjs';
import { Event, Router, Scroll } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  inAnimation,
  inOutAnimation,
} from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CheckMaxHeightDirective } from '../../../shared/directives/check-max-height.directive';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiService } from '../../../shared/services/api.service';
import { MpOneValueDashboardElementComponent } from './mp-one-value-dashboard-element/mp-one-value-dashboard-element.component';
import { MpChartDashboardElementComponent } from './mp-chart-dashboard-element/mp-chart-dashboard-element.component';
import { MpGroupDashboardElementComponent } from './mp-group-dashboard-element/mp-group-dashboard-element.component';

@Component({
  selector: 'mp-dashboard',
  standalone: true,
  imports: [
    MpOneValueDashboardElementComponent,
    MpChartDashboardElementComponent,
    LoadingComponent,
    MpGroupDashboardElementComponent,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
    NgClass,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './mp-dashboard.component.html',
  styleUrls: ['./mp-dashboard.component.scss'],
  animations: [inAnimation, inOutAnimation],
})
export class MpDashboardComponent {
  private readonly _dashboardMpService = inject(DashboardMpService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _apiService = inject(ApiService);
  private readonly _router = inject(Router);
  private readonly _viewportScroller = inject(ViewportScroller);

  readonly serverTimeOffset =
    this._apiService.apiConfiguration.serverTimeOffset;

  readonly paginationQueryParam: PaginationQueryParams = {
    pageNumber: 1,
    pageSize: 5,
  };

  private readonly _nextPageSubject = new BehaviorSubject<number>(1);
  readonly DashboardElementSize = DashboardElementSize;

  readonly dashboardElements = signal<BaseDashboardElement[] | undefined>(
    undefined,
  );

  readonly isNextPage = signal(true);
  readonly isLoadData = signal(true);

  readonly initScroll = signal(true);

  private readonly _loadDashboardElements = toSignal(
    this._router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll),
      take(1),
      switchMap((scrollEvent) =>
        this._nextPageSubject.pipe(
          tap((pageNumber) => {
            this.isLoadData.set(true);
            this.paginationQueryParam.pageNumber = pageNumber;
          }),
          switchMap(() =>
            this._dashboardMpService
              .getPagedData(this.paginationQueryParam)
              .pipe(
                tap((response) => {
                  const mapData = response.data.map((item) => {
                    switch (item.dashboardElement) {
                      case DashboardElement.Chart:
                        return Object.assign(new ChartDashboardElement(), item);
                      case DashboardElement.OneValue:
                        return Object.assign(
                          new OneValueDashboardElement(),
                          item,
                        );
                      case DashboardElement.Group:
                        return Object.assign(
                          new GroupValuesDashboardElement(),
                          item,
                        );
                    }
                  });

                  this.dashboardElements.update((currentValue) => {
                    if (currentValue) {
                      currentValue.push(...mapData);

                      return currentValue;
                    }

                    return mapData;
                  });

                  this._changeDetectorRef.detectChanges();

                  this.isNextPage.set(response.isNext);

                  if (!scrollEvent.position) {
                    this.initScroll.set(false);
                  }

                  if (
                    this.initScroll() &&
                    this.isNextPage() &&
                    scrollEvent.position &&
                    scrollEvent.position[1] + document.body.offsetHeight >=
                      document.body.scrollHeight
                  ) {
                    this.loadMore();
                    return;
                  } else if (
                    this.initScroll() &&
                    scrollEvent.position &&
                    scrollEvent.position[1] + document.body.offsetHeight <=
                      document.body.scrollHeight
                  ) {
                    this.initScroll.set(false);
                    this._viewportScroller.scrollToPosition(
                      scrollEvent.position,
                    );
                  }

                  this.isLoadData.set(false);
                }),
              ),
          ),
        ),
      ),
    ),
  );

  getDashboardElementSizeClass(dashboardElementSize: DashboardElementSize) {
    switch (dashboardElementSize) {
      case DashboardElementSize.Medium:
        return 'half-space';
      case DashboardElementSize.Large:
        return 'merged-column';
      default:
        return '';
    }
  }

  isOneValueElement(
    value: BaseDashboardElement,
  ): value is OneValueDashboardElement {
    return value instanceof OneValueDashboardElement;
  }

  isChartElement(value: BaseDashboardElement): value is ChartDashboardElement {
    return value instanceof ChartDashboardElement;
  }

  isGroupElement(
    value: BaseDashboardElement,
  ): value is GroupValuesDashboardElement {
    return value instanceof GroupValuesDashboardElement;
  }

  loadMore() {
    this._nextPageSubject.next(this.paginationQueryParam.pageNumber + 1);
  }
}
