import { inject } from '@angular/core';
import { ParamMap, ResolveFn, Router } from '@angular/router';
import { CategoryEcService } from '../services/category-ec.service';
import {
  Observable,
  catchError,
  filter,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ProductFiltersEc,
  ProductOptionEc,
} from '../models/product/product-filters-ec.interface';
import { AccordionOpenedEcService } from './accordion-opened-ec.service';
import { GetProductFiltersByCategoryIdEcQueryParams } from '../models/query-params/get-product-filters-by-category-id-ec-query-params.interface';
import { ProductEcService } from '../services/product-ec.service';
import { GetPagedProductsEcQueryParams } from '../models/query-params/get-paged-products-ec-query-params.interface';
import { GetPagedProductsEcSortBy } from '../models/query-sort-by/get-paged-products-ec-sort-by.enum';
import { ProductListItemEc } from '../models/product/product-list-item-ec.interface';
import { FavoriteEcService } from '../services/favorite-ec.service';
import { AuthService } from '../../authenticate/auth.service';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import {
  navigateToInvalidFiltersPaged,
  hasKeyDuplicatesInQueryParams,
  isInEnum,
  isNullOrEmpty,
  isNullOrWhitespace,
  containDuplicates,
} from '../../../shared/functions/helper-functions';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';

export type ProductsListResolvedData = {
  productFilters: ProductFiltersEc;
  currentOptions: CurrentOptions;
  productListResponse: ApiPagedResponse<ProductListItemEc>;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentSortBy: GetPagedProductsEcSortBy;
  favorites?: Record<string, boolean>;
};

export type CurrentOptions = { [optionName: string]: string[] };

const redirectInvalidQueryRoute = [InvalidFiltersParametersData.urlPath];

export const ecProductListResolver: ResolveFn<
  Observable<ProductsListResolvedData> | void
> = (
  route,
  state,
  categoryEcService = inject(CategoryEcService),
  productEcService = inject(ProductEcService),
  authService = inject(AuthService),
  favoriteEcService = inject(FavoriteEcService),
  accordionOpenedEcService = inject(AccordionOpenedEcService),
  router = inject(Router),
) => {
  const encodedCategoryName = route.paramMap.get('encodedCategoryName');

  if (!encodedCategoryName) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    return;
  }

  if (hasKeyDuplicatesInQueryParams(route.queryParamMap)) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
  }

  const getProductFiltersByCategoryIdEcQueryParams: GetProductFiltersByCategoryIdEcQueryParams =
    {};
  const getPagedProductsEcQueryParams: GetPagedProductsEcQueryParams = {
    pageNumber: 1,
    pageSize: productEcService.minPageSize,
    sortBy: GetPagedProductsEcSortBy.Newest,
    encodedCategoryName: encodedCategoryName,
  };

  const pageNumberString = route.queryParamMap.get('PageNumber');

  if (pageNumberString) {
    const pageNumberNumber = +pageNumberString;

    if (isNaN(pageNumberNumber) || pageNumberNumber <= 1) {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    } else {
      getPagedProductsEcQueryParams.pageNumber = pageNumberNumber;
    }
  }

  const pageSizeString = route.queryParamMap.get('PageSize');

  if (pageSizeString) {
    const pageSizeNumber = +pageSizeString;

    if (
      isNaN(pageSizeNumber) ||
      pageSizeNumber === productEcService.minPageSize ||
      !productEcService.availablePageSizes.includes(pageSizeNumber)
    ) {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    } else {
      getPagedProductsEcQueryParams.pageSize = pageSizeNumber;
    }
  }

  const sortByString = route.queryParamMap.get('SortBy');

  if (sortByString) {
    if (
      !isInEnum(sortByString, GetPagedProductsEcSortBy) ||
      sortByString === productEcService.defaultSortBy
    ) {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    } else {
      getPagedProductsEcQueryParams.sortBy = sortByString;
    }
  }

  const minPriceString = route.queryParamMap.get('MinPrice');

  if (minPriceString) {
    const minPriceNumber = +minPriceString;

    if (isNaN(minPriceNumber) || minPriceNumber < 0) {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    } else {
      getProductFiltersByCategoryIdEcQueryParams.minPrice = minPriceNumber;
      getPagedProductsEcQueryParams.minPrice = minPriceNumber;
    }
  }

  const maxPriceString = route.queryParamMap.get('MaxPrice');

  if (maxPriceString) {
    const maxPriceNumber = +maxPriceString;

    if (isNaN(maxPriceNumber) || maxPriceNumber < 0) {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    } else {
      getProductFiltersByCategoryIdEcQueryParams.maxPrice = maxPriceNumber;
      getPagedProductsEcQueryParams.maxPrice = maxPriceNumber;
    }
  }

  const result = parseProductOptionsQueryParams(
    route.queryParamMap,
    productEcService,
  );

  if (!result) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
  }

  getProductFiltersByCategoryIdEcQueryParams.productOptionParam =
    result?.parsedProductOptionsToString;
  getPagedProductsEcQueryParams.productOptionParam =
    result?.parsedProductOptionsToString;

  const hasCustomerPermission = authService.hasCustomerPermission();

  return forkJoin([
    categoryEcService.getProductFiltersByEncodedCategoryName(
      encodedCategoryName,
      getProductFiltersByCategoryIdEcQueryParams,
    ),
    productEcService
      .getPagedProductListItems(getPagedProductsEcQueryParams)
      .pipe(
        switchMap((productListResponse) =>
          hasCustomerPermission && productListResponse.data.length > 0
            ? favoriteEcService
                .getStatusOfFavorites(
                  productListResponse.data.map(
                    (i) => i.productData.encodedName,
                  ),
                )
                .pipe(
                  map((favoriteResponse) => {
                    return { productListResponse, favoriteResponse };
                  }),
                )
            : of(productListResponse),
        ),
      ),
  ]).pipe(
    map(([productFiltersResponse, productResponse]) => {
      let productListResponse!: ApiPagedResponse<ProductListItemEc>;
      let favoritesResponse: ApiResponse<Record<string, boolean>> | undefined;

      if (hasCustomerPermission) {
        const responses = productResponse as {
          productListResponse: ApiPagedResponse<ProductListItemEc>;
          favoriteResponse: ApiResponse<Record<string, boolean>>;
        };

        productListResponse =
          responses.productListResponse ??
          (productResponse as ApiPagedResponse<ProductListItemEc>);
        favoritesResponse = responses.favoriteResponse;
      } else {
        productListResponse =
          productResponse as ApiPagedResponse<ProductListItemEc>;
      }

      if (
        getPagedProductsEcQueryParams.pageNumber >
          productListResponse.totalPages &&
        getPagedProductsEcQueryParams.pageNumber !== 1
      ) {
        throw Error('Invalid filter parameters.');
      }

      if (
        productListResponse.totalPages === 0 &&
        getPagedProductsEcQueryParams.pageNumber === 1 &&
        getPagedProductsEcQueryParams.sortBy !==
          GetPagedProductsEcSortBy.Newest &&
        getPagedProductsEcQueryParams.minPrice == undefined &&
        getPagedProductsEcQueryParams.maxPrice == undefined &&
        getPagedProductsEcQueryParams.productOptionParam == undefined
      ) {
        throw Error('Invalid filter parameters.');
      }

      if (
        (productFiltersResponse.data.minPrice == undefined &&
          getPagedProductsEcQueryParams.minPrice) ||
        (productFiltersResponse.data.maxPrice == undefined &&
          getPagedProductsEcQueryParams.maxPrice)
      ) {
        throw Error('Invalid filter parameters.');
      }

      if (
        productFiltersResponse.data.minPrice &&
        getPagedProductsEcQueryParams.minPrice &&
        (getPagedProductsEcQueryParams.minPrice <=
          productFiltersResponse.data.minPrice ||
          (productFiltersResponse.data.maxPrice &&
            getPagedProductsEcQueryParams.minPrice >
              productFiltersResponse.data.maxPrice))
      ) {
        throw Error('Invalid filter parameters.');
      }

      if (
        productFiltersResponse.data.maxPrice &&
        getPagedProductsEcQueryParams.maxPrice &&
        (getPagedProductsEcQueryParams.maxPrice >=
          productFiltersResponse.data.maxPrice ||
          (productFiltersResponse.data.minPrice &&
            getPagedProductsEcQueryParams.maxPrice <
              productFiltersResponse.data.minPrice))
      ) {
        throw Error('Invalid filter parameters.');
      }

      accordionOpenedEcService.setProductOptionAccordionsOpened(
        productFiltersResponse.data.productOptions,
        result?.currentOptions,
      );

      accordionOpenedEcService.setPriceAccordionOpened(route.queryParamMap);

      if (result?.currentOptions) {
        const keys = Object.keys(result.currentOptions);
        let option: ProductOptionEc | undefined;

        keys.forEach((key) => {
          option = productFiltersResponse.data.productOptions.find(
            (f) => f.name === key,
          );

          if (!option) {
            throw Error('Invalid filter parameters.');
          }

          result.currentOptions[key].forEach((optionValue) => {
            if (
              option?.values.findIndex((o) => o.value === optionValue) === -1
            ) {
              throw Error('Invalid filter parameters.');
            }
          });
        });
      }

      return {
        productFilters: productFiltersResponse.data,
        currentOptions: result?.currentOptions,
        productListResponse: productListResponse,
        currentMinPrice: getPagedProductsEcQueryParams.minPrice,
        currentMaxPrice: getPagedProductsEcQueryParams.maxPrice,
        currentSortBy: getPagedProductsEcQueryParams.sortBy,
        favorites: favoritesResponse?.data,
      } as ProductsListResolvedData;
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        router.navigate(['not-found']);
      } else {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      }

      return of(error);
    }),
  );
};

function parseProductOptionsQueryParams(
  queryParamMap: ParamMap,
  productEcService: ProductEcService,
) {
  const productOptionsKeys = queryParamMap.keys.filter(
    (k) => !productEcService.availableBasicQueryProductsListKeys.includes(k),
  );

  if (isNullOrEmpty(productOptionsKeys)) {
    return {
      parsedProductOptionsToString: undefined,
      currentOptions: undefined,
    };
  }

  let tempValuesString: string | null;
  let splittedTempValues: string[] | undefined;
  let tempValue: string | null | undefined;
  let parsedProductOptionsToString = '[';

  let currentOptions: CurrentOptions = {};

  for (const key of productOptionsKeys) {
    tempValuesString = queryParamMap.get(key);

    if (!tempValuesString) {
      return undefined;
    }

    splittedTempValues = tempValuesString.split(',');

    if (!splittedTempValues || splittedTempValues.length <= 0) {
      return undefined;
    }

    if (splittedTempValues.length === 1) {
      tempValue = splittedTempValues[0];
      if (isNullOrWhitespace(splittedTempValues[0])) {
        return undefined;
      }

      parsedProductOptionsToString +=
        parsedProductOptionsToString.length > 1
          ? `;${key}:${splittedTempValues[0]}`
          : `${key}:${splittedTempValues[0]}`;

      currentOptions[key] = splittedTempValues;
      continue;
    }

    if (
      tempValuesString[0] !== '(' ||
      tempValuesString[tempValuesString.length - 1] !== ')'
    ) {
      return undefined;
    }

    const first = splittedTempValues[0];
    const last = splittedTempValues[splittedTempValues.length - 1];

    splittedTempValues[0] = first.slice(1, first.length);
    splittedTempValues[splittedTempValues.length - 1] = last.slice(
      0,
      last.length - 1,
    );

    if (
      splittedTempValues.some((v) => isNullOrWhitespace(v)) ||
      containDuplicates(splittedTempValues)
    ) {
      return undefined;
    }

    tempValuesString = tempValuesString.slice(1, tempValuesString.length - 1);

    parsedProductOptionsToString +=
      parsedProductOptionsToString.length > 1
        ? `;${key}:${tempValuesString}`
        : `${key}:${tempValuesString}`;

    currentOptions[key] = splittedTempValues;
  }

  return {
    parsedProductOptionsToString: parsedProductOptionsToString + ']',
    currentOptions,
  };
}
