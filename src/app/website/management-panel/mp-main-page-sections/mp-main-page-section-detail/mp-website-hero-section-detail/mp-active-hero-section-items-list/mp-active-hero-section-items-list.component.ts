import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  moveItemInArray,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  tap,
  switchMap,
  Subject,
  of,
  Observable,
  forkJoin,
  map,
  finalize,
} from 'rxjs';
import { inAnimation } from '../../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../../shared/components/photo/photo.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../../../../shared/models/helpers/value-position.interface';
import { ApiPagedResponse } from '../../../../../../shared/models/responses/api-paged-response.interface';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ChangeActivityStatusofWebsiteHeroSectionItemMp } from '../../../../models/main-page-sections/change-activity-status-of-website-hero-section-item-mp.interface';
import { WebsiteHeroSectionMp } from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { UpdatePositionsOfActiveWebsiteHeroSectionItemsMp } from '../../../../models/main-page-sections/update-positions-of-active-website-hero-section-items-mp.class';
import { WebsiteHeroSectionItemMp } from '../../../../models/main-page-sections/website-hero-section-item-mp.interface';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';
import { WebsiteHeroSectionItemMpService } from '../website-hero-section-item-mp.service';

@Component({
  selector: 'app-mp-active-website-hero-section-items-list',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    PhotoComponent,
    MatDividerModule,
    RouterLink,
    LoadingComponent,
    PhotoComponent,
    MatDividerModule,
    DatePipe,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './mp-active-hero-section-items-list.component.html',
  styleUrl: './mp-active-hero-section-items-list.component.scss',
  animations: [inAnimation],
})
export class MpActiveWebsiteHeroSectionItemsListComponent implements OnInit {
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);

  readonly websiteHeroSectionItemMpService = inject(
    WebsiteHeroSectionItemMpService,
  );

  readonly websiteHeroSection = input.required<WebsiteHeroSectionMp>();

  activeWebsiteHeroSectionItemsChanged?: WebsiteHeroSectionItemMp[];

  readonly maxActivatedItemsInWebsiteHeroSection = toSignal(
    this._mainPageSectionMpService
      .getMainPageSectionValidatorParameters()
      .pipe(map((response) => response.maxActivatedItemsInWebsiteHeroSection)),
  );

  readonly activeWebsiteHeroSectionItems = toSignal(
    this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.pipe(
      tap(() =>
        this.websiteHeroSectionItemMpService.isLoadActiveWebsiteHeroSectionItems.set(
          true,
        ),
      ),
      switchMap(() =>
        this._mainPageSectionMpService
          .getPagedWebsiteHeroSectionItems(this.websiteHeroSection().id, {
            pageNumber: 1,
            pageSize: 10,
            active: true,
          })
          .pipe(
            switchMap((firstResponse) => {
              if (!firstResponse.isNext) {
                return of(firstResponse.data).pipe(
                  finalize(() => {
                    this.websiteHeroSectionItemMpService.isLoadActiveWebsiteHeroSectionItems.set(
                      false,
                    );
                    this.activeWebsiteHeroSectionItemsChanged = undefined;
                    this.websiteHeroSectionItemMpService.isSavePositionsOfActiveItemsProcess.set(
                      false,
                    );
                    this.websiteHeroSectionItemMpService.currentDeactivateId.set(
                      undefined,
                    );
                    this.websiteHeroSectionItemMpService.currentActiveRemoveId.set(
                      undefined,
                    );
                  }),
                );
              }

              const tasks: Observable<
                ApiPagedResponse<WebsiteHeroSectionItemMp>
              >[] = [];

              for (let i = 2; i <= firstResponse.totalPages; i++) {
                tasks.push(
                  this._mainPageSectionMpService.getPagedWebsiteHeroSectionItems(
                    this.websiteHeroSection().id,
                    {
                      pageNumber: i,
                      pageSize: 1,
                      active: true,
                    },
                  ),
                );
              }

              return forkJoin(tasks).pipe(
                map((responses) => [
                  ...firstResponse.data,
                  ...responses.flatMap((i) => i.data),
                ]),
                finalize(() => {
                  this.websiteHeroSectionItemMpService.isLoadActiveWebsiteHeroSectionItems.set(
                    false,
                  );
                  this.activeWebsiteHeroSectionItemsChanged = undefined;
                  this.websiteHeroSectionItemMpService.isSavePositionsOfActiveItemsProcess.set(
                    false,
                  );
                  this.websiteHeroSectionItemMpService.currentDeactivateId.set(
                    undefined,
                  );
                  this.websiteHeroSectionItemMpService.currentActiveRemoveId.set(
                    undefined,
                  );
                }),
              );
            }),
          ),
      ),
    ),
  );

  private readonly _isSavePositionsSubject =
    new Subject<UpdatePositionsOfActiveWebsiteHeroSectionItemsMp>();

  private readonly _idSavePositionsTask = toSignal(
    this._isSavePositionsSubject.pipe(
      switchMap((model) =>
        this._mainPageSectionMpService
          .updatePositionsOfActiveWebsiteHeroSectionItems(model)
          .pipe(
            tap(() => {
              this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.next();
              this._toastService.success(
                'Positions of Website Hero Section Items has been updated.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.websiteHeroSectionItemMpService.isSavePositionsOfActiveItemsProcess.set(
                false,
              ),
            ),
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
              this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.next();
              this.websiteHeroSectionItemMpService.loadInactiveItemsSubject.next(
                undefined,
              );

              this._toastService.success(
                model.active
                  ? 'The Website Hero Section Items has been activated.'
                  : 'The Website Hero Section Items has been deactivated.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.websiteHeroSectionItemMpService.currentDeactivateId.set(
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
            this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.next();

            this._toastService.success(
              'The Website Hero Section Items has been removed.',
            );
          }),
          catchHttpError(this._toastService, () =>
            this.websiteHeroSectionItemMpService.currentActiveRemoveId.set(
              undefined,
            ),
          ),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.websiteHeroSectionItemMpService.reloadActiveItemsSubject.next();
  }

  drop(event: CdkDragDrop<WebsiteHeroSectionItemMp[]>) {
    const currentActivateItems = this.activeWebsiteHeroSectionItems();

    if (currentActivateItems) {
      if (!this.activeWebsiteHeroSectionItemsChanged) {
        this.activeWebsiteHeroSectionItemsChanged = [...currentActivateItems];
      }

      if (this.activeWebsiteHeroSectionItemsChanged) {
        moveItemInArray(
          this.activeWebsiteHeroSectionItemsChanged,
          event.previousIndex,
          event.currentIndex,
        );

        if (
          JSON.stringify(this.activeWebsiteHeroSectionItemsChanged) ===
          JSON.stringify(currentActivateItems)
        ) {
          this.activeWebsiteHeroSectionItemsChanged = undefined;
        }
      }
    }
  }

  savePositions() {
    const activeWebsiteHeroSectionItems = this.activeWebsiteHeroSectionItems();

    if (
      !activeWebsiteHeroSectionItems ||
      !this.activeWebsiteHeroSectionItemsChanged
    ) {
      return;
    }

    const idPositions: ValuePosition<string>[] = [];

    this.activeWebsiteHeroSectionItemsChanged.forEach((item, index) => {
      if (
        activeWebsiteHeroSectionItems &&
        activeWebsiteHeroSectionItems[index].id !== item.id
      ) {
        idPositions.push({ value: item.id, position: index });
      }
    });

    this.websiteHeroSectionItemMpService.isSavePositionsOfActiveItemsProcess.set(
      true,
    );
    this._isSavePositionsSubject.next(
      new UpdatePositionsOfActiveWebsiteHeroSectionItemsMp(
        this.websiteHeroSection().id,
        idPositions,
      ),
    );
  }

  deactivate(id: string) {
    this.websiteHeroSectionItemMpService.currentDeactivateId.set(id);
    this._changeActivityStatusSubject.next(
      new ChangeActivityStatusofWebsiteHeroSectionItemMp(id, false),
    );
  }

  remove(id: string) {
    this.websiteHeroSectionItemMpService.currentActiveRemoveId.set(id);
    this._removeItemSubject.next(id);
  }
}
