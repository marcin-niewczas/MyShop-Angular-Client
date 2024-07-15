import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { Subject, finalize, map, switchMap, tap } from 'rxjs';
import { WebsiteHeroSectionItemMpService } from '../website-hero-section-item-mp.service';
import { inAnimation } from '../../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../../shared/components/photo/photo.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { BreakpointObserverService } from '../../../../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ChangeActivityStatusofWebsiteHeroSectionItemMp } from '../../../../models/main-page-sections/change-activity-status-of-website-hero-section-item-mp.interface';
import { WebsiteHeroSectionMp } from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { GetPagedWebsiteHeroSectionItemsMpQueryParams } from '../../../../models/query-params/get-paged-website-hero-items-mp-query-params.interface';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';

@Component({
  selector: 'app-mp-inactive-website-hero-section-items-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    MatDividerModule,
    LoadingComponent,
    DatePipe,
    PhotoComponent,
  ],
  templateUrl: './mp-inactive-website-hero-section-items-list.component.html',
  styleUrl: './mp-inactive-website-hero-section-items-list.component.scss',
  animations: [inAnimation],
})
export class MpInactiveWebsiteHeroSectionItemsListComponent implements OnInit {
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);

  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly websiteHeroSectionItemMpService = inject(
    WebsiteHeroSectionItemMpService,
  );

  readonly websiteHeroSection = input.required<WebsiteHeroSectionMp>();

  readonly totalCount = signal<number | undefined>(undefined);

  readonly queryParams: GetPagedWebsiteHeroSectionItemsMpQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    active: false,
  };

  readonly inactiveWebsiteHeroSectionItems = toSignal(
    this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.pipe(
      tap((pageNumber) => {
        if (pageNumber != undefined) {
          this.queryParams.pageNumber = pageNumber;
        } else {
          this.queryParams.pageNumber = 1;
        }

        this.websiteHeroSectionItemMpService.isLoadInactiveWebsiteHeroSectionItems.set(
          true,
        );
      }),
      switchMap(() =>
        this._mainPageSectionMpService
          .getPagedWebsiteHeroSectionItems(
            this.websiteHeroSection().id,
            this.queryParams,
          )
          .pipe(
            map((response) => {
              this.totalCount.set(response.totalCount);
              return response.data;
            }),
            finalize(() => {
              this.websiteHeroSectionItemMpService.isLoadInactiveWebsiteHeroSectionItems.set(
                false,
              );
              this.websiteHeroSectionItemMpService.currentActivateId.set(
                undefined,
              );
              this.websiteHeroSectionItemMpService.currentInactiveRemoveId.set(
                undefined,
              );
            }),
          ),
      ),
    ),
  );

  private readonly _changeActivityStatusSubject =
    new Subject<ChangeActivityStatusofWebsiteHeroSectionItemMp>();

  private readonly _changeActivityStatusTask = toSignal(
    this._changeActivityStatusSubject.pipe(
      switchMap((model) =>
        this._mainPageSectionMpService
          .changeActivityStatusofWebsiteHeroSectionItem(model)
          .pipe(
            tap(() => {
              this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.next(
                this.queryParams.pageNumber,
              );
              this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.next();

              this._toastService.success(
                model.active
                  ? 'The Website Hero Section Items has been activated.'
                  : 'The Website Hero Section Items has been deactivated.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.websiteHeroSectionItemMpService.currentActivateId.set(
                undefined,
              ),
            ),
          ),
      ),
    ),
  );

  private readonly _removeItemSubject = new Subject<string>();

  private readonly _removeItemTask = toSignal(
    this._removeItemSubject.pipe(
      switchMap((id) =>
        this._mainPageSectionMpService.removeWebsiteHeroSectionItem(id).pipe(
          tap(() => {
            this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.next(
              this.queryParams.pageNumber,
            );

            this._toastService.success(
              'The Website Hero Section Items has been removed.',
            );
          }),
          catchHttpError(this._toastService, () =>
            this.websiteHeroSectionItemMpService.currentInactiveRemoveId.set(
              undefined,
            ),
          ),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.next(
      this.queryParams.pageNumber,
    );
  }

  changePage(pageEvent: PageEvent) {
    this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.next(
      pageEvent.pageIndex + 1,
    );
  }

  activate(id: string) {
    this.websiteHeroSectionItemMpService.currentActivateId.set(id);
    this._changeActivityStatusSubject.next(
      new ChangeActivityStatusofWebsiteHeroSectionItemMp(id, true),
    );
  }

  remove(id: string) {
    this.websiteHeroSectionItemMpService.currentInactiveRemoveId.set(id);
    this._removeItemSubject.next(id);
  }
}
