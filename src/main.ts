import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'hammerjs';
import { register as registerSwiperElements } from 'swiper/element/bundle';

registerSwiperElements();
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
