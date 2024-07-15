import { ModelSignal, WritableSignal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, tap, zip } from 'rxjs';

export abstract class BaseNavCloseSidebar {
  protected _router = inject(Router);

  readonly clickedNavItemSubject = new Subject<void>();
  abstract opened: ModelSignal<boolean> | WritableSignal<boolean>;

  private readonly _navEndEvent = toSignal(
    zip(
      this.clickedNavItemSubject,
      this._router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .pipe(tap(() => this.opened.set(false))),
    ),
  );
}
