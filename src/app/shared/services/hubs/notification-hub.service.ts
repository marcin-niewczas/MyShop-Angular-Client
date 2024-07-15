import { Injectable, OnDestroy, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { NotificationMessage } from '../../models/responses/notification/notification-message.interface';
import { Subject, filter, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { AuthService } from '../../../website/authenticate/auth.service';
import { AuthTokenState } from '../../../website/authenticate/models/auth-token-state.enum';
import { TokenStorageService } from '../../../website/authenticate/token-storage.service';
import { ToastService } from '../toast.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationHubService implements OnDestroy {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _toastService = inject(ToastService);
  private readonly _tokenStorageService = inject(TokenStorageService);
  private readonly _authService = inject(AuthService);
  private _hubConnection: HubConnection | undefined;

  private readonly _notificationSubject = new Subject<NotificationMessage>();
  readonly notification$ = this._notificationSubject.asObservable();

  connect() {
    this.init();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private init() {
    const connectionOptions: signalR.IHttpConnectionOptions = {
      accessTokenFactory: () =>
        firstValueFrom(
          of(undefined).pipe(
            switchMap(() => {
              const authTokenState = this._authService.authTokenState;

              switch (authTokenState) {
                case AuthTokenState.CannotRefresh:
                case AuthTokenState.NoAuthenticate: {
                  return from(this._hubConnection?.stop() ?? []).pipe(map(() => ''));
                }
                case AuthTokenState.Ok:
                  return of(this._tokenStorageService.accessToken!);
                case AuthTokenState.RefreshTokenInProgress:
                  return this._authService.refrereshingTokenInProgress$.pipe(
                    filter((token): token is string => !!token),
                    map((token) => token),
                  );
                case AuthTokenState.NeedRefresh: {
                  this._authService.refreshAccessToken();
                  return this._authService.refrereshingTokenInProgress$.pipe(
                    filter((token): token is string => !!token),
                    map((token) => token),
                  );
                }
              }
            }),
          ),
        ),
    };

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(`${this._enviromentService.hubSharedUrl}/notifications`, connectionOptions)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds() {
          return 2000;
        },
      })
      .configureLogging(this._enviromentService.production ? LogLevel.None : LogLevel.Information)
      .build();

    this._hubConnection.start();

    this._hubConnection.on('ReceiveNotification', (notification: NotificationMessage) => {
      this._notificationSubject.next(notification);
      this._toastService.success(notification.message, notification.notificationType);
    });
  }

  disconnect() {
    if (this._hubConnection) {
      this._hubConnection.stop();
    }
  }
}