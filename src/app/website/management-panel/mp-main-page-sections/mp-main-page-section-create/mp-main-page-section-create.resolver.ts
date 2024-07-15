import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { MainPageSectionMpService } from '../../services/main-page-section-mp.service';
import { Observable, catchError, forkJoin, of, tap } from 'rxjs';
import { MainPageSectionValidatorParametersMp } from '../../models/main-page-sections/main-page-sections-validator-parameters-mp.interface';

export const mpMainPageSectionCreateResolver: ResolveFn<
  Observable<MainPageSectionValidatorParametersMp>
> = (
  route,
  state,
  mainPageSectionMpService = inject(MainPageSectionMpService),
  router = inject(Router),
) => {
  return forkJoin([
    mainPageSectionMpService.getMainPageSectionValidatorParameters(),
    mainPageSectionMpService.getMainPageSectionsCount(),
  ]).pipe(
    tap(([validatorResponse, countResponse]) => {
      if (validatorResponse.maxMainPageSections <= countResponse.data.value) {
        throw Error('To many Main Page Sections');
      }
    }),
    catchError((error) => {
      if (error instanceof Error) {
        router.navigate(['management-panel', 'main-page-sections']);
      } else {
        router.navigate(['not-found']);
      }

      return of(error);
    }),
  );
};
