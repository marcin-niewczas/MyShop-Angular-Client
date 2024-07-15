import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  faChrome,
  faOpera,
  faSafari,
  faEdge,
  faFirefox,
  faMicrosoft,
  faLinux,
  faApple,
} from '@fortawesome/free-brands-svg-icons';
import {
  faQuestion,
  faMobileAndroid,
  faCheck,
  faDesktop,
  faMobile,
} from '@fortawesome/free-solid-svg-icons';
import { Browser } from '../models/user/browser.enum';
import { OS } from '../models/user/os.enum';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { tap, switchMap, map, finalize } from 'rxjs';

import { DatePipe, ViewportScroller } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { UserAcService } from '../services/user-ac.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { inOutAnimation, inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    FontAwesomeModule,
    MatPaginatorModule,
    LoadingComponent,
    MatDividerModule,
    DatePipe,
  ],
  templateUrl: './account-security.component.html',
  styleUrl: './account-security.component.scss',
  animations: [inOutAnimation, inAnimation],
})
export class AccountSecurityComponent implements OnInit {
  private readonly _userAcService = inject(UserAcService);
  private readonly _viewportScroller = inject(ViewportScroller);

  readonly paginationQueryParam: PaginationQueryParams = {
    pageNumber: 1,
    pageSize: 5,
  };

  readonly desktopIcon = faDesktop;
  readonly mobileIcon = faMobile;
  readonly checkIcon = faCheck;

  readonly activeDeviceTotalCount = signal(0);
  readonly isLoadingActiveDevices = signal(true);
  readonly totalPages = signal(0);
  readonly pageNumber = signal(this.paginationQueryParam.pageNumber);
  readonly activeDevices = toSignal(
    toObservable(this.pageNumber).pipe(
      tap((pageNumber) => {
        this.isLoadingActiveDevices.set(true);
        this.paginationQueryParam.pageNumber = pageNumber;
        this._viewportScroller.setOffset([0, 75]);
        this._viewportScroller.scrollToAnchor('last-activity-header');
      }),
      switchMap(() =>
        this._userAcService
          .getPagedActiveDevices(this.paginationQueryParam)
          .pipe(
            map((response) => {
              this.activeDeviceTotalCount.set(response.totalCount);
              this.totalPages.set(response.totalPages);

              return response.data;
            }),
            finalize(() => this.isLoadingActiveDevices.set(false)),
          ),
      ),
    ),
  );

  ngOnInit(): void {}

  getBrowserIcon(browserName: string) {
    switch (browserName) {
      case Browser.Chrome:
        return faChrome;
      case Browser.Opera:
        return faOpera;
      case Browser.Safari:
        return faSafari;
      case Browser.Edge:
        return faEdge;
      case Browser.Firefox:
        return faFirefox;
      default:
        return faQuestion;
    }
  }

  getOSIcon(operatingSystem: string) {
    switch (operatingSystem) {
      case OS.Windows:
        return faMicrosoft;
      case OS.Android: {
        return faMobileAndroid;
      }
      case OS.Linux || OS.Unix: {
        return faLinux;
      }
      case OS.IOS || OS.MacOS: {
        return faApple;
      }
      default:
        return faQuestion;
    }
  }
}
