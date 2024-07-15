import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { retry, throwError } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    retry({
      delay: (error, retryCount) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === HttpStatusCode.BadRequest && retryCount === 2) {
          }

          if (error.status === HttpStatusCode.NotFound && retryCount === 2) {
          }

          if (error.status === HttpStatusCode.Unauthorized) {
            router.navigate(['./']);
          }
        }

        return throwError(() => error);
      },
    })
  );
};
