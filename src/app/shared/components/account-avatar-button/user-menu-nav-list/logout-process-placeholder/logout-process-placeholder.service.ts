import {
  ApplicationRef,
  ComponentRef,
  Injectable,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { LogoutProcessPlaceholderComponent } from './logout-process-placeholder.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap, switchMap, Subject, finalize } from 'rxjs';
import { AppComponent } from '../../../../../app.component';
import { ToastService } from '../../../../services/toast.service';
import { catchHttpError } from '../../../../helpers/pipe-helpers';
import { AuthService } from '../../../../../website/authenticate/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LogoutProcessPlaceholderService {
  private readonly _applicationRef = inject(ApplicationRef);
  private readonly _toastService = inject(ToastService);
  private readonly _authService = inject(AuthService);

  private readonly _viewAppComponent = this._applicationRef.components
    .find((x) => x.componentType == AppComponent)!
    .injector.get(ViewContainerRef);

  private readonly _logoutSubject = new Subject<void>();

  private readonly _logoutTask = toSignal(
    this._logoutSubject.pipe(
      tap(() => this.show()),
      switchMap(() =>
        this._authService
          .logout()
          .pipe(catchHttpError(this._toastService, () => this.destroy()))
      )
    )
  );

  private _logoutProcessPlaceholderComponentRef?: ComponentRef<LogoutProcessPlaceholderComponent>;

  startLogout() {
    if (!this._logoutProcessPlaceholderComponentRef) {
      this._logoutSubject.next();
    }
  }

  private show() {
    this._logoutProcessPlaceholderComponentRef =
      this._viewAppComponent.createComponent(LogoutProcessPlaceholderComponent);
  }

  private destroy() {
    this._logoutProcessPlaceholderComponentRef?.destroy();
    this._logoutProcessPlaceholderComponentRef = undefined;
  }
}
