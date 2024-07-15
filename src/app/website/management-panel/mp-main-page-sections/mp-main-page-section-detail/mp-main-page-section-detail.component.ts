import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  MainPageSectionMp,
  isWebsiteProductCarouselSectionMp,
  isWebsiteHeroSectionMp,
} from '../../models/main-page-sections/main-page-section-mp.interface';
import { MainPageSectionMpService } from '../../services/main-page-section-mp.service';
import { MpWebsiteHeroSectionDetailComponent } from './mp-website-hero-section-detail/mp-website-hero-section-detail.component';
import { MpWebsiteProductsCarouselDetailComponent } from './mp-website-products-carousel-detail/mp-website-products-carousel-detail.component';

@Component({
  selector: 'app-mp-main-page-section-detail',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MpWebsiteHeroSectionDetailComponent,
    MpWebsiteProductsCarouselDetailComponent,
  ],
  templateUrl: './mp-main-page-section-detail.component.html',
  styleUrl: './mp-main-page-section-detail.component.scss',
})
export class MpMainPageSectionDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Page Sections', routerLink: '../../' },
  ];

  mainPageSection?: MainPageSectionMp;

  private readonly _mainPageSectionDataLoader = toSignal(
    this._activatedRoute.data.pipe(
      tap((data) => {
        this.breadcrumbsItems.push({
          label: data[Object.getOwnPropertySymbols(data)[0]],
        });

        this.mainPageSection = data['mainPageSection'] as MainPageSectionMp;
      }),
    ),
  );

  readonly isWebsiteProductCarouselSectionMp =
    isWebsiteProductCarouselSectionMp;
  readonly isWebsiteHeroSectionMp = isWebsiteHeroSectionMp;

  readonly isRemoveProcess = signal(false);

  private readonly _removeMainPageSectionSubject = new Subject<string>();

  private readonly _removeMainPageSectionTask = toSignal(
    this._removeMainPageSectionSubject.pipe(
      tap(() => this.isRemoveProcess.set(true)),
      switchMap((id) =>
        this._mainPageSectionMpService.removeMainPageSection(id).pipe(
          tap(() => {
            this._router.navigate(['../../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success(
              'The Main Page Section has been removed.',
            );
          }),
          catchHttpError(this._toastService, () =>
            this.isRemoveProcess.set(false),
          ),
        ),
      ),
    ),
  );

  removeMainPageSection(id: string) {
    this._removeMainPageSectionSubject.next(id);
  }
}
