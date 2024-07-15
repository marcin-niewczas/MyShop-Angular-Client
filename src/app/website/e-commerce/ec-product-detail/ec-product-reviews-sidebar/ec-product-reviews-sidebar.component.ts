import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductEcService } from '../../services/product-ec.service';
import {
  Subject,
  Subscription,
  catchError,
  debounce,
  filter,
  finalize,
  of,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { GetPagedProductReviewsQueryParams } from '../../../../shared/models/requests/query-models/product-review/get-paged-product-reviews-query-params.interface';
import { ProductReviewEc } from '../../models/product-review/product-review-ec.interface';
import { GetPagedProductReviewsSortBy } from '../../../../shared/models/sort-by/get-paged-product-reviews-sort-by.enum';
import { MatChipsModule } from '@angular/material/chips';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CreateProductReviewEc } from '../../models/product-review/create-product-review-ec.class';
import { UpdateProductReviewEc } from '../../models/product-review/update-product-review-ec.class';
import { ProductReviewEcService } from '../../services/product-review-ec.service';
import { MatDividerModule } from '@angular/material/divider';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inAnimation, inOutAnimation } from '../../../../shared/components/animations';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ReviewRatingStatsComponent } from '../../../../shared/components/review-rating-stats/review-rating-stats.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SortDirectionIconButtonComponent } from '../../../../shared/components/sort-direction-icon-button/sort-direction-icon-button.component';
import { StarRatingInputComponent } from '../../../../shared/components/star-rating-input/star-rating-input.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { CheckMaxHeightDirective } from '../../../../shared/directives/check-max-height.directive';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ProductReviewRateStats } from '../../../../shared/models/product/product-review-rate-stats.interface';
import { SortDirection } from '../../../../shared/models/requests/query-models/common/sort-direction.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { AuthService } from '../../../authenticate/auth.service';


@Component({
  selector: 'app-ec-product-reviews-sidebar',
  standalone: true,
  imports: [
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    NgTemplateOutlet,
    ReviewRatingStatsComponent,
    SortDirectionIconButtonComponent,
    MatChipsModule,
    KeyValuePipe,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    StarRatingInputComponent,
    LoadingComponent,
    MatDividerModule,
    AvatarComponent,
    StarRatingComponent,
    DatePipe,
    CheckMaxHeightDirective,
    InfiniteScrollDirective,
    MatChipsModule,
  ],
  templateUrl: './ec-product-reviews-sidebar.component.html',
  styleUrl: './ec-product-reviews-sidebar.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class EcProductReviewsSidebarComponent
  implements OnInit, OnChanges, OnDestroy
{
  private readonly _productEcService = inject(ProductEcService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _productReviewEcService = inject(ProductReviewEcService);
  private readonly _toastService = inject(ToastService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  readonly breakpointObserverService = inject(BreakpointObserverService);

  readonly opened = model.required<boolean>();
  readonly productId = input.required<string>();

  readonly rateChange = output<ProductReviewRateStats>();

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly productReviewRateStats = signal<ProductReviewRateStats | undefined>(
    undefined,
  );
  readonly productReviews = signal<ProductReviewEc[] | undefined>(undefined);

  private readonly _loadPagedProductReviewsSubject = new Subject<
    'Reset' | 'FullReset' | void
  >();
  private _getPagedProductReviewsSub?: Subscription;

  private readonly _updateProductReviewRateStatsSubject = new Subject<
    true | void
  >();
  private _getProductReviewRateStatsSub?: Subscription;

  readonly isLoadProductReviewRateStats = signal(true);

  private readonly _getProductReviewMeByProductIdSubject = new Subject<void>();
  private _getProductReviewMeByProductIdSub?: Subscription;

  private readonly _createOrUpdateOrRemoveMyProductReviewSubject = new Subject<
    CreateProductReviewEc | UpdateProductReviewEc | string
  >();
  private _createOrUpdateOrRemoveMyProductReviewSub?: Subscription;

  readonly queryParams: GetPagedProductReviewsQueryParams = {
    pageNumber: 0,
    pageSize: 10,
    sortDirection: SortDirection.Desc,
    sortBy: GetPagedProductReviewsSortBy.Newest,
  };

  readonly GetPagedProductReviewsSortBy = GetPagedProductReviewsSortBy;

  readonly isProductReviewsNextPage = signal(true);
  readonly isLoadPagedProductReviews = signal(true);
  readonly isResetPagedProductReviews = signal(false);
  readonly manageMyProductReviewMode = signal(false);

  readonly createUpdateFormGroup = this._formBuilder.group({
    rate: this._formBuilder.control(null as number | null, [
      Validators.required,
    ]),
    textReview: this._formBuilder.control(undefined as string | undefined),
  });

  readonly myProductReview = signal<ProductReviewEc | undefined | null>(
    undefined,
  );
  readonly isCreateOrUpdateProcess = signal(false);
  readonly isRemoveProcess = signal(false);

  readonly isSomethingChangeInForm = signal(false);

  private readonly _manageMyProductReviewModeClose = toSignal(
    toObservable(this.manageMyProductReviewMode).pipe(
      filter((v) => !v),
      tap(() => {
        const myProductReview = this.myProductReview();
        if (myProductReview) {
          this.createUpdateFormGroup.setValue({
            rate: myProductReview.rate,
            textReview: myProductReview.review,
          });
        } else {
          this.createUpdateFormGroup.reset();
        }
      }),
    ),
  );

  private _isFirstOpened = true;

  ngOnChanges(changes: SimpleChanges): void {
    const openedValue = changes['opened']?.currentValue;

    if (openedValue && this._isFirstOpened) {
      this._isFirstOpened = false;
      this._updateProductReviewRateStatsSubject.next();
      this._loadPagedProductReviewsSubject.next();
      this._getProductReviewMeByProductIdSubject.next();
      this._validatorParametersSubject.next();
    }
  }

  private readonly _validatorParametersSubject = new Subject<void>();

  readonly validatorParameters = toSignal(
    this._validatorParametersSubject.pipe(
      switchMap(() =>
        this._productReviewEcService.getValidatorParameters().pipe(
          tap((validatorParameters) => {
            this.createUpdateFormGroup.controls.textReview.addValidators(
              CustomValidators.mapValidators(
                validatorParameters.productReviewTextParams,
              ),
            );
            this.createUpdateFormGroup.controls.textReview.updateValueAndValidity();
          }),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this._getProductReviewRateStatsSub =
      this._updateProductReviewRateStatsSubject
        .pipe(
          tap(() => this.isLoadProductReviewRateStats.set(true)),
          switchMap((value) =>
            this._productEcService
              .getProductReviewRateStats(this.productId())
              .pipe(
                tap((response) => {
                  this.productReviewRateStats.set(response.data);

                  if (value === true) {
                    this.rateChange.emit(response.data);
                  }
                }),
                finalize(() => this.isLoadProductReviewRateStats.set(false)),
              ),
          ),
        )
        .subscribe();

    this._getPagedProductReviewsSub = this._loadPagedProductReviewsSubject
      .pipe(
        debounce((resetType) =>
          resetType === 'Reset' ? timer(300) : of(undefined),
        ),
        tap((resetType) => {
          switch (resetType) {
            case 'FullReset': {
              this.productReviews.set(undefined);
              this.queryParams.pageNumber = 1;
              this.queryParams.productReviewRate = undefined;
              this.queryParams.sortBy = GetPagedProductReviewsSortBy.Newest;
              this.queryParams.sortDirection = SortDirection.Desc;
              break;
            }

            case 'Reset': {
              this.isResetPagedProductReviews.set(true);
              this.queryParams.pageNumber = 1;
              break;
            }

            default: {
              this.queryParams.pageNumber += 1;
              break;
            }
          }

          this.isLoadPagedProductReviews.set(true);
        }),
        switchMap((isReset) =>
          this._productEcService
            .getPagedProductReviews(this.productId(), this.queryParams)
            .pipe(
              tap((response) => {
                this.productReviews.update((current) => {
                  if (
                    current &&
                    isReset !== 'Reset' &&
                    isReset !== 'FullReset'
                  ) {
                    current.push(...response.data);
                    return current;
                  }

                  return response.data;
                });

                this.isProductReviewsNextPage.set(response.isNext);

                this._changeDetectorRef.detectChanges();
              }),
              finalize(() => {
                if (isReset === 'Reset') {
                  this.isResetPagedProductReviews.set(false);
                }

                this.isLoadPagedProductReviews.set(false);
              }),
            ),
        ),
      )
      .subscribe();

    if (this._authService.hasCustomerPermission()) {
      this._getProductReviewMeByProductIdSub =
        this._getProductReviewMeByProductIdSubject
          .pipe(
            switchMap(() =>
              this._productEcService
                .getProductReviewMeByProductId(this.productId())
                .pipe(
                  tap((response) => {
                    this.fillCreateUpdateFormGroup(response.data);
                    this.myProductReview.set(response.data);
                  }),
                  catchError((error) => {
                    if (
                      error instanceof HttpErrorResponse &&
                      error.status === HttpStatusCode.NotFound
                    ) {
                      this.myProductReview.set(null);
                      return of(null);
                    }

                    return throwError(() => error);
                  }),
                ),
            ),
          )
          .subscribe();

      this._createOrUpdateOrRemoveMyProductReviewSub =
        this._createOrUpdateOrRemoveMyProductReviewSubject
          .pipe(
            switchMap((model) => {
              this.createUpdateFormGroup.disable();

              if (typeof model === 'string') {
                this.isRemoveProcess.set(true);
                return this._productReviewEcService.remove(model).pipe(
                  tap(() => {
                    this.myProductReview.set(null);
                    this._toastService.success(
                      'Product Review has been removed.',
                    );
                    this._updateProductReviewRateStatsSubject.next(true);
                    this._loadPagedProductReviewsSubject.next('FullReset');
                    this.manageMyProductReviewMode.set(false);
                    this.createUpdateFormGroup.reset();
                  }),
                  catchHttpError(this._toastService),
                  finalize(() => {
                    this.createUpdateFormGroup.enable();
                    this.isRemoveProcess.set(false);
                  }),
                );
              }
              this.isCreateOrUpdateProcess.set(true);
              return (
                model instanceof CreateProductReviewEc
                  ? this._productReviewEcService.create(model)
                  : this._productReviewEcService.update(model)
              ).pipe(
                tap((response) => {
                  this.fillCreateUpdateFormGroup(response.data);
                  this.myProductReview.set(response.data);

                  if (model instanceof CreateProductReviewEc) {
                    this.manageMyProductReviewMode.set(false);
                  }

                  this._toastService.success(
                    `Product Review has been ${model instanceof CreateProductReviewEc ? 'created' : 'updated'}.`,
                  );

                  this._updateProductReviewRateStatsSubject.next(true);
                  this._loadPagedProductReviewsSubject.next('FullReset');
                }),
                catchHttpError(this._toastService),
                finalize(() => {
                  this.createUpdateFormGroup.enable();
                  this.isCreateOrUpdateProcess.set(false);
                }),
              );
            }),
          )
          .subscribe();

      this.createUpdateFormGroup.valueChanges
        .pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(() => !!this.myProductReview()),
          tap((value) => {
            if (
              value.rate !== this.myProductReview()?.rate ||
              value.textReview !== this.myProductReview()?.review
            ) {
              this.isSomethingChangeInForm.set(true);
            } else {
              this.isSomethingChangeInForm.set(false);
            }
          }),
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this._getProductReviewRateStatsSub) {
      this._getProductReviewRateStatsSub.unsubscribe();
    }

    if (this._getPagedProductReviewsSub) {
      this._getPagedProductReviewsSub.unsubscribe();
    }

    if (this._getProductReviewMeByProductIdSub) {
      this._getProductReviewMeByProductIdSub.unsubscribe();
    }

    if (this._createOrUpdateOrRemoveMyProductReviewSub) {
      this._createOrUpdateOrRemoveMyProductReviewSub.unsubscribe();
    }
  }

  onActiveRateChange() {
    if (this.queryParams.productReviewRate) {
      this.queryParams.sortBy = GetPagedProductReviewsSortBy.Newest;
      this.queryParams.sortDirection = SortDirection.Desc;
    }

    this._loadPagedProductReviewsSubject.next('Reset');
  }

  onCreateOrUpdateProductReview() {
    this.createUpdateFormGroup.markAllAsTouched();

    if (!this.createUpdateFormGroup.valid) {
      return;
    }

    const myProductReview = this.myProductReview();

    const formValue = this.createUpdateFormGroup.value;

    if (myProductReview) {
      this._createOrUpdateOrRemoveMyProductReviewSubject.next(
        new UpdateProductReviewEc(
          myProductReview.id,
          formValue.rate!,
          formValue.textReview,
        ),
      );
    } else {
      this._createOrUpdateOrRemoveMyProductReviewSubject.next(
        new CreateProductReviewEc(
          this.productId(),
          formValue.rate!,
          formValue.textReview,
        ),
      );
    }
  }

  onRemoveProductReview() {
    const myProductReview = this.myProductReview();

    if (myProductReview) {
      this._createOrUpdateOrRemoveMyProductReviewSubject.next(
        myProductReview.id,
      );
    }
  }

  private fillCreateUpdateFormGroup(model: ProductReviewEc) {
    this.createUpdateFormGroup.controls.rate.setValue(model.rate);
    this.createUpdateFormGroup.controls.textReview.setValue(model.review);
  }

  onSortDirectionChange(sortDirection?: SortDirection) {
    this.queryParams.sortDirection = sortDirection;
    this._loadPagedProductReviewsSubject.next('Reset');
  }

  onSortByChange(sortBy: GetPagedProductReviewsSortBy) {
    this.queryParams.sortBy = sortBy;
    this._loadPagedProductReviewsSubject.next('Reset');
  }

  onLoadMore() {
    this._loadPagedProductReviewsSubject.next();
  }
}
