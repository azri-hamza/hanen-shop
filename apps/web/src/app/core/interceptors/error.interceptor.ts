import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        const message = error.error?.message ?? 'Validation error';
        toast.error(`Bad request: ${message}`);
      } else if (error.status === 404) {
        toast.error(error.error?.message ?? 'Not found');
      } else if (error.status === 500) {
        toast.error('Server error, try again later');
      } else if (error.status === 0) {
        toast.error('Cannot reach server. Check your connection.');
      } else {
        toast.error(`Unexpected error (${error.status})`);
      }

      return throwError(() => error);
    }),
  );
};
