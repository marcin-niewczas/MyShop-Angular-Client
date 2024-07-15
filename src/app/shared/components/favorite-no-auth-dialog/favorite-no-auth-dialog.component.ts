import { Component, HostListener, OnDestroy, model } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ShadowOverlayComponent } from '../shadow-overlay/shadow-overlay.component';
import { inOutAnimation } from '../animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorite-no-auth-dialog',
  standalone: true,
  imports: [ShadowOverlayComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './favorite-no-auth-dialog.component.html',
  styleUrl: './favorite-no-auth-dialog.component.scss',
  animations: [inOutAnimation],
})
export class FavoriteNoAuthDialogComponent implements OnDestroy {
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.opened.set(false);
  }

  readonly opened = model<boolean>(false);

  private readonly _hideScrollbar = toSignal(
    toObservable(this.opened).pipe(
      tap((opened) => {
        if (opened) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      })
    )
  );

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
