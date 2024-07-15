import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreakpointObserverService {
  private readonly _breakpointObserver = inject(BreakpointObserver);

  private readonly _isXSmallScreen = signal(false);
  private readonly _isSmallScreen = signal(false);
  private readonly _isMediumScreen = signal(false);
  private readonly _isLargeScreen = signal(false);
  private readonly _isXLargeScreen = signal(false);

  private readonly _isHandset = signal(false);
  private readonly _isTablet = signal(false);
  private readonly _isWeb = signal(false);

  readonly isSmallScreen = this._isSmallScreen.asReadonly();
  readonly isXSmallScreen = this._isXSmallScreen.asReadonly();
  readonly isMediumScreen = this._isMediumScreen.asReadonly();
  readonly isLargeScreen = this._isLargeScreen.asReadonly();
  readonly isXLargeScreen = this._isXLargeScreen.asReadonly();

  readonly isHandset = this._isHandset.asReadonly();
  readonly isTablet = this._isTablet.asReadonly();
  readonly isWeb = this._isWeb.asReadonly();

  private readonly _breakpointObserverSignal = toSignal(
    this._breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Large,
        Breakpoints.XLarge,
        Breakpoints.Handset,
        Breakpoints.Tablet,
        Breakpoints.Web,
      ])
      .pipe(
        map(() => {
          this._isXSmallScreen.set(this._breakpointObserver.isMatched([Breakpoints.XSmall]));
          this._isSmallScreen.set(this._breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]));
          this._isMediumScreen.set(this._breakpointObserver.isMatched([Breakpoints.Medium]));
          this._isLargeScreen.set(this._breakpointObserver.isMatched([Breakpoints.Large, Breakpoints.XLarge]));
          this._isXLargeScreen.set(this._breakpointObserver.isMatched(Breakpoints.XLarge));

          this._isHandset.set(this._breakpointObserver.isMatched(Breakpoints.Handset));
          this._isTablet.set(this._breakpointObserver.isMatched([Breakpoints.Handset, Breakpoints.Tablet]));
          this._isWeb.set(this._breakpointObserver.isMatched([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]));

          return;
        }),
      ),
  );
}