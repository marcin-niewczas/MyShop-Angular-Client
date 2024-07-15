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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subject, tap, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { CreateWebsiteHeroSectionMp } from '../../../models/main-page-sections/create-website-hero-section-mp.class';
import { MainPageSectionMpService } from '../../../services/main-page-section-mp.service';

@Component({
  selector: 'app-mp-website-hero-section-create-form',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatSelectModule,
  ],
  templateUrl: './mp-website-hero-section-create-form.component.html',
  styleUrl: './mp-website-hero-section-create-form.component.scss',
})
export class MpWebsiteHeroSectionCreateFormComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  get validatorParameters() {
    return this._mainPageSectionMpService.mainPageSectionValidatorParameters;
  }

  readonly isCreateProcess = model.required<boolean>();

  readonly formGroup = this._formBuilder.group({
    label: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this._mainPageSectionMpService.mainPageSectionValidatorParameters
          ?.websiteHeroSectionLabelParams!,
      ),
    ),
    displayType: this._formBuilder.control(
      null as string | null,
      Validators.required,
    ),
  });

  private readonly _createSectionSubject =
    new Subject<CreateWebsiteHeroSectionMp>();

  private readonly _createSectionTask = toSignal(
    this._createSectionSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isCreateProcess.set(true);
      }),
      switchMap((model) =>
        this._mainPageSectionMpService.createWebsiteHeroSection(model).pipe(
          tap((response) => {
            this._toastService.success(
              'The Website Hero Section has been created.',
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
      new CreateWebsiteHeroSectionMp(value.label!, value.displayType!),
    );
  }
}
