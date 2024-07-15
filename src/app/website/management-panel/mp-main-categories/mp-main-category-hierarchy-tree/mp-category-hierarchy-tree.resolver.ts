import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of, forkJoin, map, Observable } from 'rxjs';
import { CategoryMp } from '../../models/category/category-mp.interface';
import { CategoryMpService } from '../../services/category-mp.service';
import { GetCategoryMpQueryType } from '../../models/query-types/get-category-mp-query-type.enum';

export const mpCategoryHierarchyTreeResolver: ResolveFn<
  Observable<CategoryMp>
> = (
  route,
  state,
  router = inject(Router),
  categoryMpService = inject(CategoryMpService),
) => {
  return forkJoin([
    categoryMpService.getById(
      route.paramMap.get('mainCategoryId')!,
      GetCategoryMpQueryType.IncludeLowerCategories,
    ),
    categoryMpService.getValidatorParameters(),
  ]).pipe(
    map(([responseCategory]) => responseCategory.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
