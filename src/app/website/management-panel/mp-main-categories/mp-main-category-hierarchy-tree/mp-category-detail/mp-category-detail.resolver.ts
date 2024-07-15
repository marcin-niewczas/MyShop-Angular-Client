import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, of, map } from 'rxjs';
import { CategoryMp } from '../../../models/category/category-mp.interface';
import { GetCategoryMpQueryType } from '../../../models/query-types/get-category-mp-query-type.enum';
import { CategoryMpService } from '../../../services/category-mp.service';

export const mpSubcategoryDetailResolver: ResolveFn<CategoryMp> = (
  route,
  state,
  router = inject(Router),
  categoryMpService = inject(CategoryMpService),
) => {
  const mainCategoryId =
    route.parent?.parent?.parent?.paramMap.get('mainCategoryId') ??
    route.parent?.parent?.paramMap.get('mainCategoryId');

  return categoryMpService
    .getById(
      route.parent?.paramMap.get('subcategoryId')!,
      GetCategoryMpQueryType.NoInclude,
    )
    .pipe(
      map((response) => {
        if (mainCategoryId != response.data.rootCategoryId) {
          throw Error('Wrong Main Category Id.');
        }

        if (
          categoryMpService.validatorParameters?.categoryMaxLevel! <=
            response.data.level &&
          route.url[0]?.path === 'create'
        ) {
          throw Error('Category Level has been exceeded.');
        }

        return response.data;
      }),
      catchError((error) => {
        if (
          error instanceof Error &&
          error.message === 'Category Level has been exceeded.'
        ) {
          router.navigate([
            'management-panel',
            'categories',
            mainCategoryId,
            'details',
          ]);
        } else {
          router.navigate(['not-found']);
        }
        return of(error);
      }),
    );
};

export const mpMainCategoryDetailResolver: ResolveFn<CategoryMp> = (
  route,
  state,
  router = inject(Router),
  categoryMpService = inject(CategoryMpService),
) => {
  const id =
    route.parent?.paramMap.get('mainCategoryId') ??
    route.parent?.parent?.paramMap.get('mainCategoryId')!;

  return categoryMpService.getById(id, GetCategoryMpQueryType.NoInclude).pipe(
    map((response) => response.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
