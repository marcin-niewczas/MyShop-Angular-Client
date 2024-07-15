import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, finalize, map, switchMap, tap } from 'rxjs';
import { CategoryMp } from '../../../models/category/category-mp.interface';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CategoryMpService } from '../../../services/category-mp.service';
import { CategoryHelperMpService } from '../../category-helper-mp.service';
import { inAnimation } from '../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-mp-category-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatDividerModule,
    LoadingComponent,
  ],
  templateUrl: './mp-category-detail.component.html',
  styleUrl: './mp-category-detail.component.scss',
  animations: [inAnimation],
})
export class MpCategoryDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _categoryMpServie = inject(CategoryMpService);
  private readonly _categoryHelperMpService = inject(CategoryHelperMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly category = toSignal(
    this._activatedRoute.data.pipe(
      map(({ category }) => category as CategoryMp),
    ),
  );

  readonly isRemoveProcess = signal(false);

  private readonly _removeCategorySubject = new Subject<string>();

  private readonly _removeCategoryTask = toSignal(
    this._removeCategorySubject.pipe(
      tap(() => this.isRemoveProcess.set(true)),
      switchMap((id) =>
        this._categoryMpServie.remove(id).pipe(
          tap(() => {
            const category = this.category();
            if (category) {
              if (category?.level === 0) {
                this._router.navigate(['../../'], {
                  relativeTo: this._activatedRoute,
                });
              } else {
                this._categoryHelperMpService.emitRefreshTreeCategory();
                this._router.navigate(['../../../', 'details'], {
                  relativeTo: this._activatedRoute,
                });
              }

              this._toastService.success('The Category has been removed.');
            }
          }),
          catchHttpError(this._toastService),
          finalize(() => this.isRemoveProcess.set(false)),
        ),
      ),
    ),
  );

  removeCategory() {
    const id = this.category()?.id;
    id && this._removeCategorySubject.next(id);
  }
}
