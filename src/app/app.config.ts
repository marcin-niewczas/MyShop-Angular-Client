import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HammerModule } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideHammerJSConfig } from './providers/hammer-js-config-provider';
import { provideCustomTitleStrategy } from './providers/title-strategy-provider';
import { delayInterceptor } from './shared/interceptors/delay.interceptor';
import { authInterceptor } from './website/authenticate/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ROUTES } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      ROUTES,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideAnimationsAsync(),
    provideCustomTitleStrategy(),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withInterceptors([delayInterceptor, authInterceptor])),
    provideToastr({
      positionClass: 'toast-bottom-right',
      maxOpened: 3,
      timeOut: 2000,
    }),
    importProvidersFrom(HammerModule),
    provideHammerJSConfig(),
    provideNativeDateAdapter(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
