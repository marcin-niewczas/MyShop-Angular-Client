import { Component, inject, input, model, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, finalize, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { inOutAnimation } from '../../../../../shared/components/animations';
import { ProductMpService } from '../../../services/product-mp.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiPagedResponse } from '../../../../../shared/models/responses/api-paged-response.interface';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';
import { PagedProductVariantMp } from '../../../models/product-variant/paged-product-variant-mp.interface';

@Component({
  selector: 'app-mp-paged-product-variants-list',
  standalone: true,
  imports: [
    MatPaginatorModule,
    MatDividerModule,
    MatButtonModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    MatIconModule,
  ],
  templateUrl: './mp-paged-product-variants-list.component.html',
  styleUrl: './mp-paged-product-variants-list.component.scss',
  animations: [inOutAnimation],
})
export class MpPagedProductVariantsListComponent {
  private readonly _productMpService = inject(ProductMpService);
  readonly breakpointObserverService = inject(BreakpointObserverService);

  readonly pagedProductVariantsResponse =
    model.required<ApiPagedResponse<PagedProductVariantMp>>();
  readonly productId = input.required<string>();

  readonly isLoadData = signal(false);

  private readonly _pageEventSubject = new Subject<PageEvent>();

  private readonly _pageEventTasks = toSignal(
    this._pageEventSubject.pipe(
      tap(() => this.isLoadData.set(true)),
      switchMap((pageEvent) =>
        this._productMpService
          .getPagedProductVariantsByProductId(this.productId(), {
            pageNumber: pageEvent.pageIndex + 1,
            pageSize: pageEvent.pageSize,
          })
          .pipe(
            tap((response) => {
              this.pagedProductVariantsResponse.set(response);
            }),
            finalize(() => this.isLoadData.set(false)),
          ),
      ),
    ),
  );

  onChangePage(pageEvent: PageEvent) {
    this._pageEventSubject.next(pageEvent);
  }
}
