import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';
import {
  WebsiteHeroSectionMp,
  isWebsiteHeroSectionMp,
} from '../../../../models/main-page-sections/main-page-section-mp.interface';

export const mpWebsiteHeroSectionUpdateResolver: ResolveFn<
  Observable<WebsiteHeroSectionMp>
> = (
  route,
  state,
  mainPageSectionMpService = inject(MainPageSectionMpService),
  router = inject(Router),
) => {
  return forkJoin([
    mainPageSectionMpService.getMainPageSection(
      route.params['mainPageSectionId'],
    ),
    mainPageSectionMpService.getMainPageSectionValidatorParameters(),
  ]).pipe(
    map(([response]) => {
      if (!isWebsiteHeroSectionMp(response.data)) {
        throw Error('Not found');
      }

      return response.data as WebsiteHeroSectionMp;
    }),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
