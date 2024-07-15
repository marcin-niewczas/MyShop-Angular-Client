import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export function catchHttpError(
  toastService: ToastService,
  afterCatch?: () => void
) {
  return catchError((error) => {
    if (error instanceof HttpErrorResponse) {
      toastService.error(error.error.detail, error.error.title);
      if (afterCatch) {
        afterCatch();
      }
      return of(error);
    }

    return throwError(() => error);
  });
}
