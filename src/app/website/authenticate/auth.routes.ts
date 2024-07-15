import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../authenticate/auth/auth.component').then(
        (mod) => mod.AuthComponent
      ),
  },
];
