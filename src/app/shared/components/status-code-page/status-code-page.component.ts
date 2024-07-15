import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { inAnimation } from '../animations';
import { GlobalThemeService } from '../../../../themes/global-theme.service';
import { StatusCodePageData } from './status-code-page-data.class';

@Component({
  selector: 'app-status-code-page',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './status-code-page.component.html',
  styleUrl: './status-code-page.component.scss',
  animations: [inAnimation],
})
export class StatusCodePageComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _globalThemeService = inject(GlobalThemeService);

  readonly statusPageData = toSignal(
    this._activatedRoute.data.pipe(
      map(({ statusCodePageData }) => statusCodePageData as StatusCodePageData),
    ),
  );

  ngOnInit(): void {
    if (!this._globalThemeService.theme()) {
      this._globalThemeService.setCurrentTheme();
    }
  }
}
