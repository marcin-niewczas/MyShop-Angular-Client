import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { of, throwError, retry, take, filter, timer, Observable, mergeMap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthTokenState } from './models/auth-token-state.enum';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authTokenStorageService = inject(TokenStorageService);
  const router = inject(Router);

  if (req.url.includes(`health-checks`) || !authService.isAuthenticated) {
    if (authService.authTokenState === AuthTokenState.CannotRefresh) {
      authTokenStorageService.clearData();
      document.location.href = '/authenticate';
    }

    return next(req).pipe(
      retry({
        delay: (error, retryCount) => {
          if (retryCount === 10 || (error instanceof HttpErrorResponse && error.status === 0)) {
            router.navigate(['./page-server-down']);
            return throwError(() => error);
          }

          return throwError(() => error);
        },
      }),
    );
  }

  return authCheck(next, req, authTokenStorageService, authService).pipe(
    retry({
      delay: (error, retryCount) => {
        if (retryCount === 10 || (error instanceof HttpErrorResponse && error.status === 0)) {
          router.navigate(['./page-server-down']);
          return throwError(() => error);
        }

        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
          const authTokenState = authService.authTokenState;

          if (authTokenState === AuthTokenState.RefreshTokenInProgress) {
            return authService.refrereshingTokenInProgress$.pipe(
              filter((x) => x !== undefined),
              take(1),
              mergeMap((value) => next(addAuthorizationHeader(req, value!))),
            );
          }

          return timer(500);
        }

        if (
          error instanceof HttpErrorResponse &&
          error.status === HttpStatusCode.BadRequest &&
          error.url?.includes('refresh-access-token')
        ) {
          authTokenStorageService.clearData();
          document.location.href = '/authenticate'
        }

        return throwError(() => error);
      },
    }),
  );
};

function addAuthorizationHeader(req: HttpRequest<unknown>, accessToken: string) {
  return req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + accessToken) });
}

function authCheck(
  next: HttpHandlerFn,
  req: HttpRequest<unknown>,
  authTokenStorageService: TokenStorageService,
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  return of({}).pipe(
    mergeMap(() => {
      const authTokenState = authService.authTokenState;

      if (
        authTokenState === AuthTokenState.NoAuthenticate ||
        (req.url.includes('refresh-access-token') && authService.refreshingTokenInProgress)
      ) {
        return next(req);
      }

      if (authTokenState === AuthTokenState.Ok && authTokenStorageService.accessToken) {
        return next(addAuthorizationHeader(req, authTokenStorageService.accessToken));
      }

      if (authTokenState === AuthTokenState.NeedRefresh) {
        authService.refreshAccessToken();
      }

      return authService.refrereshingTokenInProgress$.pipe(
        filter((x) => x !== undefined),
        take(1),
        mergeMap((value) => next(addAuthorizationHeader(req, value!))),
      );
    }),
  );
}