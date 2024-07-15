import { Injectable, signal } from '@angular/core';

@Injectable()
export class ToolbarMpService {
  private readonly _routeLabel = signal<string | undefined>(undefined);
  readonly routeLabel = this._routeLabel.asReadonly();

  setRouterLabel(value?: string) {
    this._routeLabel.set(value);
  }
}
