import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MainPageSectionEcService } from '../services/main-page-section-ec.service';
import { Subject, filter, finalize, merge, switchMap, tap, zip } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetPagedMainPageSectionsEcQueryParams } from '../models/query-params/get-paged-main-page-sections-ec-query-params.interface';
import { ActivatedRoute, Event, Router, Scroll } from '@angular/router';
import {
  MainPageSectionEc,
  isWebsiteHeroSectionEc,
  isWebsiteProductCarouselSectionEc,
} from '../models/main-page-section/main-page-section-ec.interface';
import { EcMainPageSectionsResolvedData } from './ec-main-page-sections.resolver';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { EcWebsiteHeroSectionItemComponent } from './items/ec-website-hero-section-item/ec-website-hero-section-item.component';
import { EcWebsiteProductsCarouselSectionItemComponent } from './items/ec-website-products-carousel-section-item/ec-website-products-carousel-section-item.component';
import { ViewportScroller } from '@angular/common';
import { inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CheckMaxHeightDirective } from '../../../shared/directives/check-max-height.directive';

@Component({
  selector: 'app-ec-main-page-sections',
  standalone: true,
  imports: [
    LoadingComponent,
    CheckMaxHeightDirective,
    InfiniteScrollDirective,
    EcWebsiteHeroSectionItemComponent,
    EcWebsiteProductsCarouselSectionItemComponent,
  ],
  templateUrl: './ec-main-page-sections.component.html',
  styleUrl: './ec-main-page-sections.component.scss',
  animations: [inAnimation],
})
export class EcMainPageSectionsComponent {
  private readonly _mainPageSectionEcService = inject(MainPageSectionEcService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _router = inject(Router);
  private readonly _viewportScroller = inject(ViewportScroller);

  private readonly _loadMoreSubject = new Subject<void>();

  readonly isLoadMore = signal(true);
  readonly isNext = signal(true);

  readonly mainPageSections = signal<MainPageSectionEc[] | undefined>(
    undefined,
  );

  queryParams!: GetPagedMainPageSectionsEcQueryParams;

  readonly isWebsiteHeroSection = isWebsiteHeroSectionEc;
  readonly isWebsiteProductCarouselSection = isWebsiteProductCarouselSectionEc;

  private readonly _mainPageSections = toSignal(
    merge(
      zip([
        this._activatedRoute.data,
        this._router.events.pipe(
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
      ]).pipe(
        tap(([{ resolvedData }, scrollEvent]) => {
          const data = resolvedData as EcMainPageSectionsResolvedData;
          this.queryParams = data.queryParams;
          this.isNext.set(data.response.isNext);

          this.mainPageSections.set(data.response.data);
          this.isLoadMore.set(false);

          if (scrollEvent.position) {
            this._changeDetectorRef.detectChanges();

            this._viewportScroller.scrollToPosition(scrollEvent.position);
          }
        }),
      ),
      this._loadMoreSubject.pipe(
        tap(() => {
          this.queryParams.pageNumber += 1;
          this.isLoadMore.set(true);
        }),
        switchMap(() =>
          this._mainPageSectionEcService
            .getPagedMainPageSections(this.queryParams)
            .pipe(
              tap((response) => {
                this.isNext.set(response.isNext);

                this.mainPageSections.update((current) => {
                  if (current) {
                    current.push(...response.data);
                    return current;
                  }

                  return response.data;
                });
              }),
              finalize(() => this.isLoadMore.set(false)),
            ),
        ),
      ),
    ),
  );

  loadMore() {
    this._loadMoreSubject.next();
  }
}
