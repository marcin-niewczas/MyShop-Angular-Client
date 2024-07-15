import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { inAnimation } from '../../../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../../../../shared/models/helpers/value-position.interface';
import { PaginationQueryParams } from '../../../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../../../../shared/models/responses/api-paged-response.interface';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ProductVariantOptionOfProductMp } from '../../../../models/product-option/variants/product-variant-option-of-product-mp.interface';
import { UpdateProductOptionsPositionsOfProductMp } from '../../../../models/product/update-product-options-positions-of-product-mp.class';
import { ProductMpService } from '../../../../services/product-mp.service';
import { MpProductVariantOptionsOfProductUpdateResolvedData } from './mp-product-variant-options-of-product-update.resolver';

@Component({
  selector: 'app-mp-product-variant-options-of-product-update',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDividerModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    LoadingComponent,
  ],
  templateUrl: './mp-product-variant-options-of-product-update.component.html',
  styleUrl: './mp-product-variant-options-of-product-update.component.scss',
  animations: [inAnimation],
})
export class MpProductVariantOptionsOfProductUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _toastService = inject(ToastService);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../' },
  ];

  mainOption!: ProductVariantOptionOfProductMp;
  additionalOptions!: ProductVariantOptionOfProductMp[];

  additionalOptionsChanged?: ProductVariantOptionOfProductMp[];

  private _reloadProductVariantOptionsQueryParams!: PaginationQueryParams;

  readonly product = toSignal(
    this._activatedRoute.data.pipe(
      map(({ mpProductVariantOptionsOfProductUpdateResolvedData }) => {
        const data =
          mpProductVariantOptionsOfProductUpdateResolvedData as MpProductVariantOptionsOfProductUpdateResolvedData;

        this.breadcrumbsItems.push(
          ...[
            { label: data.product.fullName, routerLink: '../../' },
            { label: 'Update Product Variant Options' },
          ],
        );

        this.mainOption = data.mainProductVariantOption;
        this.additionalOptions = data.additionalProductVariantOptions;
        this._reloadProductVariantOptionsQueryParams = data.queryParams;

        return data.product;
      }),
    ),
  );

  private readonly _reloadProductVariantOptionsSubject = new Subject<void>();

  readonly isReloadProductVariantOptions = signal(false);

  private readonly _reloadProductDetailOptionsTask = toSignal(
    this._reloadProductVariantOptionsSubject.pipe(
      tap(() => {
        this.isReloadProductVariantOptions.set(true);
        this._reloadProductVariantOptionsQueryParams.pageNumber = 1;
      }),
      switchMap(() =>
        this._productMpService
          .getPagedProductVariantOptionsByProductId(
            this.product()!.id,
            this._reloadProductVariantOptionsQueryParams,
          )
          .pipe(
            switchMap((firstResponse) => {
              if (firstResponse.isNext) {
                const taskList: Observable<
                  ApiPagedResponse<ProductVariantOptionOfProductMp>
                >[] = [];

                for (let i = 2; i <= firstResponse.totalCount; i++) {
                  this._reloadProductVariantOptionsQueryParams.pageNumber += 1;
                  taskList.push(
                    this._productMpService.getPagedProductVariantOptionsByProductId(
                      this.product()!.id,
                      this._reloadProductVariantOptionsQueryParams,
                    ),
                  );
                }

                return forkJoin(taskList).pipe(
                  map((responses) => [
                    ...firstResponse.data,
                    ...responses.flatMap((x) => x.data),
                  ]),
                  tap((productDetailOptions) => {
                    this.mainOption = productDetailOptions[0];
                    this.additionalOptions = productDetailOptions.splice(
                      1,
                      productDetailOptions.length,
                    );
                    this.additionalOptionsChanged = undefined;
                  }),
                  finalize(() => this.resetProcessState()),
                );
              }

              return of(firstResponse.data).pipe(
                tap((productVariantOptions) => {
                  this.mainOption = productVariantOptions[0];
                  this.additionalOptions = productVariantOptions.splice(
                    1,
                    productVariantOptions.length,
                  );
                  this.additionalOptionsChanged = undefined;
                }),
                finalize(() => this.resetProcessState()),
              );
            }),
          ),
      ),
    ),
  );

  readonly isSavePositionsProcess = signal(false);

  private readonly _isSavePositionsSubject =
    new Subject<UpdateProductOptionsPositionsOfProductMp>();

  private readonly _isSavePositionsTask = toSignal(
    this._isSavePositionsSubject.pipe(
      switchMap((model) =>
        this._productMpService
          .saveProductVariantOptionsPositionsOfProduct(model)
          .pipe(
            tap(() => {
              this._toastService.success(
                'Positions of Product Variant Options has been updated.',
              );

              this._reloadProductVariantOptionsSubject.next();
            }),
            catchHttpError(this._toastService, () =>
              this.isSavePositionsProcess.set(false),
            ),
          ),
      ),
    ),
  );

  readonly isProcess = computed(() => this.isSavePositionsProcess());

  drop(event: CdkDragDrop<ProductVariantOptionOfProductMp[]>) {
    if (!this.additionalOptionsChanged && this.additionalOptions) {
      this.additionalOptionsChanged = [...this.additionalOptions];
    }

    if (this.additionalOptionsChanged) {
      moveItemInArray(
        this.additionalOptionsChanged,
        event.previousIndex,
        event.currentIndex,
      );

      if (
        JSON.stringify(this.additionalOptionsChanged) ===
        JSON.stringify(this.additionalOptions)
      ) {
        this.additionalOptionsChanged = undefined;
      }
    }
  }

  savePositions() {
    if (!this.additionalOptions || !this.additionalOptionsChanged) {
      return;
    }

    const idPositions: ValuePosition<string>[] = [];

    this.additionalOptionsChanged.forEach((item, index) => {
      if (
        this.additionalOptions &&
        this.additionalOptions[index].id !== item.id
      ) {
        idPositions.push({ value: item.id, position: index + 1 });
      }
    });

    const productId = this.product()?.id;

    if (productId) {
      this.isSavePositionsProcess.set(true);
      this._isSavePositionsSubject.next(
        new UpdateProductOptionsPositionsOfProductMp(productId, idPositions),
      );
    }
  }

  private resetProcessState() {
    this.isReloadProductVariantOptions.set(false);
    this.isSavePositionsProcess.set(false);
  }
}
