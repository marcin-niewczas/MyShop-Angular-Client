import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { inAnimation } from '../animations';
import { InvalidFiltersParametersData } from './invalid-filters-parameters-data.class';

@Component({
  selector: 'app-invalid-filters-parameters',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './invalid-filters-parameters.component.html',
  styleUrl: './invalid-filters-parameters.component.scss',
  animations: [inAnimation],
})
export class InvalidFiltersParametersComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly data = toSignal(
    this._activatedRoute.data.pipe(
      map(
        ({ invalidFiltersParametersData }) =>
          invalidFiltersParametersData as InvalidFiltersParametersData
      )
    )
  );
}
