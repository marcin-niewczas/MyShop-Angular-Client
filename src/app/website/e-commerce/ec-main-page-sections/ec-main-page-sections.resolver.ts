import { ResolveFn } from '@angular/router';
import { MainPageSectionEcService } from '../services/main-page-section-ec.service';
import { inject } from '@angular/core';
import { MainPageSectionEc } from '../models/main-page-section/main-page-section-ec.interface';
import { GetPagedMainPageSectionsEcQueryParams } from '../models/query-params/get-paged-main-page-sections-ec-query-params.interface';
import { map } from 'rxjs';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';

export type EcMainPageSectionsResolvedData = {
  response: ApiPagedResponse<MainPageSectionEc>;
  queryParams: GetPagedMainPageSectionsEcQueryParams;
};

export const ecMainPageSectionsResolver: ResolveFn<
  EcMainPageSectionsResolvedData
> = (
  route,
  state,
  mainPageSectionEcService = inject(MainPageSectionEcService),
) => {
  const queryParams: GetPagedMainPageSectionsEcQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    productCarouselItemsCount: 10,
  };

  return mainPageSectionEcService.getPagedMainPageSections(queryParams).pipe(
    map((response) => {
      return { queryParams, response } as EcMainPageSectionsResolvedData;
    }),
  );
};
