import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, map, catchError, of } from 'rxjs';
import { isWebsiteHeroSectionMp, WebsiteHeroSectionMp } from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { WebsiteHeroSectionItemValidatorParametersMp } from '../../../../models/main-page-sections/website-hero-section-item-validator-parameters-mp.interface';

export const mpWebsiteHeroSectionItemCreateResolver: ResolveFn<
  WebsiteHeroSectionItemValidatorParametersMp
> = (
  route,
  state,
  mainPageSectionMpService = inject(MainPageSectionMpService),
  router = inject(Router),
) => {
  const id = route.params['mainPageSectionId'];
  return forkJoin([
    mainPageSectionMpService.getMainPageSection(id),
    mainPageSectionMpService.getWebsiteHeroSectionItemValidatorParameters(id),
  ]).pipe(
    map(([mainPageSectionResponse]) => {
      if (!isWebsiteHeroSectionMp(mainPageSectionResponse.data)) {
        throw Error('Not found');
      }

      return mainPageSectionResponse.data as WebsiteHeroSectionMp;
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        router.navigate(['not-found']);
      }

      return of(error);
    }),
  );
};
