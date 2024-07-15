import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { map } from 'rxjs';
import { PWADialogComponent } from './shared/components/pwa-dialog/pwa-dialog.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PWADialogComponent],
  template: `<router-outlet></router-outlet>
    <app-pwa-dialog [(opened)]="openedPWADialog"></app-pwa-dialog>`,
})
export class AppComponent {
  private readonly swUpdate = inject(SwUpdate);
  readonly openedPWADialog = signal(false);

  private readonly _swChecker = toSignal(
    this.swUpdate.versionUpdates.pipe(
      map((versionEvent) => {
        if (versionEvent.type === 'VERSION_READY') {
          this.openedPWADialog.set(true);
        }
      }),
    ),
  );
}
