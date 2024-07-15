import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export enum ECommerceRouteSection {
  OrderStepper = 1,
  OrderSummaries = 2,
}

@Injectable()
export class ECommerceRouteService {
  readonly currentRouteSection = signal<ECommerceRouteSection | undefined>(
    undefined,
  );
  readonly currentRouteSection$ = toObservable(this.currentRouteSection);
}
