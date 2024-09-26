import { Routes } from '@angular/router';
import { appGuard } from './app.guard';
import { StatusCodePageData } from './shared/components/status-code-page/status-code-page-data.class';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./website/website.component').then((mod) => mod.WebsiteComponent),
    loadChildren: () =>
      import('./website/website.routes').then((mod) => mod.WEBSITE_ROUTES),
    canActivate: [appGuard],
  },
  {
    path: 'page-not-found',
    loadComponent: () =>
      import(
        './shared/components/status-code-page/status-code-page.component'
      ).then((mod) => mod.StatusCodePageComponent),
    title: '404 Not found - myShop',
    data: {
      statusCodePageData: new StatusCodePageData(
        '404 Page Not Found :(',
        'Ooops! The URL was not found on this server.',
        undefined,
      ),
    },
  },
  {
    path: 'page-server-down',
    loadComponent: () =>
      import(
        './shared/components/status-code-page/status-code-page.component'
      ).then((mod) => mod.StatusCodePageComponent),
    title: 'Server is down - myShop',
    data: {
      statusCodePageData: new StatusCodePageData(
        'Server is down :(',
        'Go back later or try again.',
        'Try again',
      ),
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import(
        './shared/components/status-code-page/status-code-page.component'
      ).then((mod) => mod.StatusCodePageComponent),
    title: '404 Not found - myShop',
    data: {
      statusCodePageData: new StatusCodePageData(
        '404 Page Not Found :(',
        'Ooops! The URL was not found on this server.',
        undefined,
      ),
    },
  },
];
