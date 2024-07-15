import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserAddressAcService } from '../services/user-address-ac.service';
import {
  Subject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [LoadingComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './account-addresses.component.html',
  styleUrl: './account-addresses.component.scss',
  animations: [inAnimation],
})
export class AccountAddressesComponent {
  private readonly _userAddressAcService = inject(UserAddressAcService);
  private readonly _toastService = inject(ToastService);

  private readonly _reloadUserAddressesSubject = new Subject<void>();

  get validatorParameters() {
    return this._userAddressAcService.validatorParameters;
  }

  readonly userAddresses = toSignal(
    this._reloadUserAddressesSubject.pipe(
      startWith({}),
      switchMap(() =>
        this._userAddressAcService.getAll().pipe(
          map((response) => response.data),
          finalize(() => {
            if (this.currentRemoveUserAddressId()) {
              this.currentRemoveUserAddressId.set(undefined);
            }
            if (this.isRemoveProcess()) {
              this.isRemoveProcess.set(false);
            }
          }),
        ),
      ),
    ),
  );

  private readonly _removeUserAddressSubject = new Subject<string>();
  readonly isRemoveProcess = signal(false);
  readonly currentRemoveUserAddressId = signal<string | undefined>(undefined);

  private readonly _removeUserAddress = toSignal(
    this._removeUserAddressSubject.pipe(
      tap((id) => {
        this.currentRemoveUserAddressId.set(id);
        this.isRemoveProcess.set(true);
      }),
      switchMap((id) =>
        this._userAddressAcService.remove(id).pipe(
          tap(() => {
            this._reloadUserAddressesSubject.next();
            this._toastService.success('User Address has been removed');
          }),
          catchError((error) => {
            this.currentRemoveUserAddressId.set(undefined);
            this.isRemoveProcess.set(false);
            this._toastService.error(
              "User Address hasn't been removed. Try again later.",
            );
            return of(error);
          }),
        ),
      ),
    ),
  );

  removeUserAddress(id: string) {
    this._removeUserAddressSubject.next(id);
  }
}
