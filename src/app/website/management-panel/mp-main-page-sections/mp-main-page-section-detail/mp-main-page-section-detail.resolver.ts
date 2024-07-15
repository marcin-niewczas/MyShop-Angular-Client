import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { MainPageSectionMpService } from '../../services/main-page-section-mp.service';
import { Observable, catchError, map, of } from 'rxjs';
import {
  MainPageSectionMp,
  isWebsiteHeroSectionMp,
  isWebsiteProductCarouselSectionMp,
} from '../../models/main-page-sections/main-page-section-mp.interface';

export const mpMainPageSectionDetailResolver: ResolveFn<
  Observable<MainPageSectionMp>
> = (
  route,
  state,
  mainPageSectionMpService = inject(MainPageSectionMpService),
  router = inject(Router),
) => {
  return mainPageSectionMpService
    .getMainPageSection(route.params['mainPageSectionId'])
    .pipe(
      map((response) => response.data),
      catchError((error) => {
        router.navigate(['not-found']);
        return of(error);
      }),
    );
};

export const mpManPageSectionDetailTitleResolver: ResolveFn<string> = (
  route,
  state,
) => {
  const data = route.parent?.data['mainPageSection'] as MainPageSectionMp;

  if (isWebsiteHeroSectionMp(data)) {
    return `${data.label} - ${data.mainPageSectionType}`;
  }

  if (isWebsiteProductCarouselSectionMp(data)) {
    return `${data.productsCarouselSectionType} - ${data.mainPageSectionType}`;
  }

  throw Error('Not implemented.');
};
