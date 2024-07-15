import { Component, inject, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, tap, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateWebsiteProductCarouselSectionMp } from '../../../models/main-page-sections/create-website-product-carousel-section.class';
import { MainPageSectionMpService } from '../../../services/main-page-section-mp.service';

@Component({
  selector: 'app-mp-website-products-carousel-section-create-form',
  standalone: true,
  imports: [
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
  ],
  templateUrl:
    './mp-website-products-carousel-section-create-form.component.html',
  styleUrl: './mp-website-products-carousel-section-create-form.component.scss',
})
export class MpWebsiteProductsCarouselSectionCreateFormComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly isCreateProcess = model.required<boolean>();

  get validatorParameters() {
    return this._mainPageSectionMpService.mainPageSectionValidatorParameters;
  }

  readonly formGroup = this._formBuilder.group({
    productsCarouselSectionType: this._formBuilder.control(
      null as string | null,
      [Validators.required],
    ),
  });

  private readonly _createSectionSubject =
    new Subject<CreateWebsiteProductCarouselSectionMp>();

  private readonly _createSectionTask = toSignal(
    this._createSectionSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isCreateProcess.set(true);
      }),
      switchMap((model) =>
        this._mainPageSectionMpService
          .createWebsiteProductCarouselSection(model)
          .pipe(
            tap((response) => {
              this._toastService.success(
                'The Website Products Carousel Section has been created.',
              );
              this._router.navigate(['../', response.id, 'details'], {
                relativeTo: this._activatedRoute,
              });
            }),
            catchHttpError(this._toastService, () => {
              this.isCreateProcess.set(false);
              this.formGroup.enable();
            }),
          ),
      ),
    ),
  );

  create() {
    if (!this.formGroup.valid) {
      return;
    }

    const value = this.formGroup.value;

    this._createSectionSubject.next(
      new CreateWebsiteProductCarouselSectionMp(
        value.productsCarouselSectionType!,
      ),
    );
  }
}
