import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, map, switchMap, tap, zip } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../../shared/validators/custom-validator';
import { WebsiteHeroSectionMp } from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { UpdateWebsiteHeroSectionMp } from '../../../../models/main-page-sections/update-website-hero-section-mp.class';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';

@Component({
  selector: 'app-mp-website-hero-section-update',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbsComponent,
    LoadingComponent,
    RouterLink,
  ],
  templateUrl: './mp-website-hero-section-update.component.html',
  styleUrl: './mp-website-hero-section-update.component.scss',
})
export class MpWebsiteHeroSectionUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Page Sections', routerLink: '../../' },
  ];

  readonly formGroup = this._formBuilder.group({
    label: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this._mainPageSectionMpService.mainPageSectionValidatorParameters
          ?.websiteHeroSectionLabelParams!,
      ),
    ),
  });

  get validatorParameters() {
    return this._mainPageSectionMpService.mainPageSectionValidatorParameters;
  }

  readonly isUpdateProcess = signal(false);

  readonly websiteHeroSection = toSignal(
    this._activatedRoute.data.pipe(
      map(({ websiteHeroSection }) => {
        const data = websiteHeroSection as WebsiteHeroSectionMp;

        this.breadcrumbsItems.push(
          ...[
            {
              label: `${data.label} - ${data.mainPageSectionType}`,
              routerLink: ['../', 'details'],
            },
            { label: 'Update' },
          ],
        );

        this.formGroup.setValue({ label: data.label });

        return data;
      }),
    ),
  );

  readonly somethingChange = toSignal(
    zip([this.formGroup.valueChanges, this.formGroup.statusChanges]).pipe(
      map(([value, status]) => {
        if (status === 'VALID') {
          const websiteHeroSection = this.websiteHeroSection();
          if (websiteHeroSection) {
            if (value.label !== websiteHeroSection.label) {
              return true;
            }
          }
        }

        return false;
      }),
    ),
  );

  private readonly _updateSectionSubject =
    new Subject<UpdateWebsiteHeroSectionMp>();

  private readonly _updateSectionTask = toSignal(
    this._updateSectionSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isUpdateProcess.set(true);
      }),
      switchMap((model) =>
        this._mainPageSectionMpService.updateWebsiteHeroSection(model).pipe(
          tap(() => {
            this._toastService.success(
              'The Website Hero Section has been updated.',
            );
            this._router.navigate(['../', 'details'], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  update() {
    const websiteHeroSection = this.websiteHeroSection();

    if (!this.formGroup.valid || !websiteHeroSection) {
      return;
    }

    const value = this.formGroup.value;

    this._updateSectionSubject.next(
      new UpdateWebsiteHeroSectionMp(websiteHeroSection.id, value.label!),
    );
  }
}
