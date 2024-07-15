import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MainPageSectionMpService } from '../services/main-page-section-mp.service';
import { BehaviorSubject, Subject, finalize, switchMap, tap } from 'rxjs';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { MatDividerModule } from '@angular/material/divider';
import {
  MainPageSectionMp,
  isWebsiteHeroSectionMp,
  isWebsiteProductCarouselSectionMp,
} from '../models/main-page-sections/main-page-section-mp.interface';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inAnimation, inOutAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../shared/models/helpers/value-position.interface';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-mp-main-page-sections',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    LoadingComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatDividerModule,
    DatePipe,
    MatTooltipModule,
  ],
  templateUrl: './mp-main-page-sections.component.html',
  styleUrl: './mp-main-page-sections.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpMainPageSectionsComponent {
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);

  mainPageSections?: readonly MainPageSectionMp[];
  mainPageSectionsChanged?: MainPageSectionMp[];

  private readonly _loadMainPageSectionsSubject = new BehaviorSubject<void>(
    undefined,
  );

  readonly validatorParameters = toSignal(
    this._mainPageSectionMpService.getMainPageSectionValidatorParameters(),
  );

  private readonly _mainPageSectionsLoader = toSignal(
    this._loadMainPageSectionsSubject.pipe(
      switchMap(() =>
        this._mainPageSectionMpService.getAllMainPageSections().pipe(
          tap((response) => {
            this.mainPageSections = response.data;
            this.mainPageSectionsChanged = undefined;
          }),
          finalize(() => {
            this.isSavePositionsProcess.set(false);
            this.currentIdRemove.set(undefined);
          }),
        ),
      ),
    ),
  );

  readonly isSavePositionsProcess = signal(false);

  private readonly _isSavePositionsSubject = new Subject<
    ValuePosition<string>[]
  >();

  private readonly _idSavePositionsTask = toSignal(
    this._isSavePositionsSubject.pipe(
      switchMap((models) =>
        this._mainPageSectionMpService
          .savePositionsOfMainPageSections(models)
          .pipe(
            tap(() => {
              this._loadMainPageSectionsSubject.next();
              this._toastService.success(
                'Positions of Main Page Sections has been updated.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.isSavePositionsProcess.set(false),
            ),
          ),
      ),
    ),
  );

  readonly currentIdRemove = signal<string | undefined>(undefined);

  private readonly _removeMainPageSectionSubject = new Subject<string>();

  private readonly _removeMainPageSectionTask = toSignal(
    this._removeMainPageSectionSubject.pipe(
      tap((id) => this.currentIdRemove.set(id)),
      switchMap((id) =>
        this._mainPageSectionMpService.removeMainPageSection(id).pipe(
          tap(() => {
            this._loadMainPageSectionsSubject.next();
            this._toastService.success(
              'The Main Page Section has been removed.',
            );
          }),
          catchHttpError(this._toastService, () =>
            this.currentIdRemove.set(undefined),
          ),
        ),
      ),
    ),
  );

  readonly isProcess = computed(
    () => this.isSavePositionsProcess() || this.currentIdRemove(),
  );

  readonly isWebsiteProductCarouselSectionMp =
    isWebsiteProductCarouselSectionMp;
  readonly isWebsiteHeroSectionMp = isWebsiteHeroSectionMp;

  drop(event: CdkDragDrop<MainPageSectionMp[]>) {
    if (!this.mainPageSectionsChanged && this.mainPageSections) {
      this.mainPageSectionsChanged = [...this.mainPageSections];
    }

    if (this.mainPageSectionsChanged) {
      moveItemInArray(
        this.mainPageSectionsChanged,
        event.previousIndex,
        event.currentIndex,
      );

      if (
        JSON.stringify(this.mainPageSectionsChanged) ===
        JSON.stringify(this.mainPageSections)
      ) {
        this.mainPageSectionsChanged = undefined;
      }
    }
  }

  savePositions() {
    if (!this.mainPageSections || !this.mainPageSectionsChanged) {
      return;
    }

    const idPositions: ValuePosition<string>[] = [];

    this.mainPageSectionsChanged.forEach((item, index) => {
      if (
        this.mainPageSections &&
        this.mainPageSections[index].id !== item.id
      ) {
        idPositions.push({ value: item.id, position: index });
      }
    });

    this.isSavePositionsProcess.set(true);
    this._isSavePositionsSubject.next(idPositions);
  }

  removeMainPageSection(id: string) {
    this._removeMainPageSectionSubject.next(id);
  }
}
