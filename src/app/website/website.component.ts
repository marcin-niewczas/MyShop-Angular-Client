import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss',
  animations: [
    trigger('outTrigger', [
      transition(':leave', [animate('.5s ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class WebsiteComponent {
  private readonly _router = inject(Router);

  readonly showProgressBar = toSignal(
    this._router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .pipe(map((event) => event instanceof NavigationStart)),
  );
}
