import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map, catchError, of, switchMap, forkJoin, tap } from 'rxjs';
import { AuthService } from './website/authenticate/auth.service';
import { ApiService } from './shared/services/api.service';
import { NotificationService } from './shared/services/notification.service';
import { GlobalThemeService } from '../themes/global-theme.service';

export const appGuard: CanActivateFn = (route, state) => {
  const globalThemeService = inject(GlobalThemeService);
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const notificationService = inject(NotificationService);

  globalThemeService.setCurrentTheme();

  if (authService.isAuthenticated) {
    return apiService.healthCheck().pipe(
      switchMap(() => {
        return forkJoin([
          authService.getUserMe().pipe(
            tap(() => {
              if (authService.hasCustomerPermission()) {
                notificationService.loadMoreNotifications();
              }
            }),
          ),
          apiService.getSharedConfiguration(),
        ]).pipe(
          map(() => true),
          catchError(() => of(false)),
        );
      }),
    );
  }

  return apiService.healthCheck().pipe(
    switchMap(() =>
      apiService.getSharedConfiguration().pipe(
        map(() => true),
        catchError(() => of(false)),
      ),
    ),
  );
};
