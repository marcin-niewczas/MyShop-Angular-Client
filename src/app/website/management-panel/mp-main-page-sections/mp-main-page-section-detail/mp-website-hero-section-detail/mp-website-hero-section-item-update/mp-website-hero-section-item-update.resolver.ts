import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { forkJoin, map, catchError, of } from 'rxjs';
import {
  WebsiteHeroSectionMp,
  isWebsiteHeroSectionMp,
} from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { WebsiteHeroSectionItemMp } from '../../../../models/main-page-sections/website-hero-section-item-mp.interface';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';

export type MpWebsiteHeroSectionItemUpdateResolvedData = {
  websiteHeroSection: WebsiteHeroSectionMp;
  websiteHeroSectionItem: WebsiteHeroSectionItemMp;
};

export const mpWebsiteHeroSectionItemUpdateResolver: ResolveFn<boolean> = (
  route,
  state,
  mainPageSectionMpService = inject(MainPageSectionMpService),
  router = inject(Router),
) => {
  const mainPageSectionId = route.params['mainPageSectionId'];
  const websiteHeroSectionItemId = route.params['websiteHeroSectionItemId'];
  return forkJoin([
    mainPageSectionMpService.getMainPageSection(mainPageSectionId),
    mainPageSectionMpService.getWebsiteHeroSectionItem(
      websiteHeroSectionItemId,
    ),
    mainPageSectionMpService.getWebsiteHeroSectionItemValidatorParameters(
      mainPageSectionId,
    ),
  ]).pipe(
    map(([mainPageSectionResponse, websiteHeroSectionItemResponse]) => {
      if (
        !isWebsiteHeroSectionMp(mainPageSectionResponse.data) ||
        mainPageSectionResponse.data.id !==
          websiteHeroSectionItemResponse.data.websiteHeroSectionId
      ) {
        throw Error('Not found');
      }

      return {
        websiteHeroSection: mainPageSectionResponse.data,
        websiteHeroSectionItem: websiteHeroSectionItemResponse.data,
      } as MpWebsiteHeroSectionItemUpdateResolvedData;
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        router.navigate(['not-found']);
      }

      return of(error);
    }),
  );
};
