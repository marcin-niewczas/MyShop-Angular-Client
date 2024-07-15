import {
  Directive,
  ElementRef,
  input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event, Router, Scroll } from '@angular/router';
import { filter, fromEvent, tap } from 'rxjs';

@Directive({
  standalone: true,
  selector: '[showHideScrollToolbar]',
  exportAs: 'showHideScrollToolbar',
})
export class ShowHideScrollToolbarDirective implements OnChanges {
  readonly disableShowHideScrollToolbar = input(false);
  readonly translateInPixel = input<number>();
  readonly zIndex = input<number>();
  readonly startHide = input(130);
  readonly block = input(false);
  private readonly _isTransformed = signal(false);
  readonly isTransformed = this._isTransformed.asReadonly();

  private _initialZIndex: number;
  private _lastScrollPosition =
    window.scrollY || document.documentElement.scrollTop;

  private _isResizeWindow = false;

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _router: Router
  ) {
    this._initialZIndex = this._elementRef.nativeElement.style['zIndex'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.disableShowHideScrollToolbar()) {
      this.setTransformY('0%');
      this._isTransformed.set(false);
    }
  }

  private readonly _transitionStyle =
    this._elementRef.nativeElement.style.transition;

  private _transitionDisabled = false;
  private _blockTransform = false;

  private _scrollRouterEvent = toSignal(
    this._router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll),
      tap((event) => {
        if (event.position == null || event.position[1] === 0) {
          this._elementRef.nativeElement.style.transition = 'none';
          this._transitionDisabled = true;
        }

        this._blockTransform = true;
      })
    )
  );

  private readonly _resizeWindowEvent = toSignal(
    fromEvent(window, 'resize').pipe(
      filter(() => !this.block()),
      tap(() => (this._isResizeWindow = true))
    )
  );

  private readonly _scrollEvent = toSignal(
    fromEvent(window, 'scroll').pipe(
      filter(() => !this.block()),
      tap(() => this.showHideToolbar())
    )
  );

  showHideToolbar() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    if (this.block()) {
      this._lastScrollPosition = scrollPosition;
      return;
    }

    if (this._isResizeWindow) {
      this._lastScrollPosition = scrollPosition;
      this._isResizeWindow = false;

      return;
    }

    if (this._blockTransform && scrollPosition > 0) {
      this._blockTransform = false;
      this._lastScrollPosition = scrollPosition;
      return;
    }

    if (scrollPosition <= this.startHide()) {
      if (this.translateInPixel() != undefined) {
        this.setTransformY(`-${this.translateInPixel()}px`);
        this.setTransformY('0%');
        this._isTransformed.set(false);
      } else {
        this.setTransformY('-100%');
        this.setTransformY('0%');
        this._isTransformed.set(false);
      }

      if (this.zIndex() != undefined) {
        this.setZIndex(this._initialZIndex);
      }

      this._lastScrollPosition = scrollPosition;
      return;
    }

    if (
      this.disableShowHideScrollToolbar() ||
      scrollPosition < this.startHide()
    ) {
      if (this._transitionDisabled) {
        this._elementRef.nativeElement.style['transition'] =
          this._transitionStyle;
        this._transitionDisabled = false;
      }

      this._lastScrollPosition = scrollPosition;
      return;
    }

    if (scrollPosition > this._lastScrollPosition) {
      if (this.translateInPixel() != undefined) {
        this.setTransformY('0%');
        this.setTransformY(`-${this.translateInPixel()}px`);
        this._isTransformed.set(true);
      } else {
        this.setTransformY('0%');
        this.setTransformY('-100%');
        this._isTransformed.set(true);
      }

      if (this.zIndex() != undefined) {
        this.setZIndex(this.zIndex());
      }
    } else {
      if (this.translateInPixel() != undefined) {
        this.setTransformY(`-${this.translateInPixel()}px`);
        this.setTransformY('0%');
        this._isTransformed.set(false);
      } else {
        this.setTransformY('-100%');
        this.setTransformY('0%');
        this._isTransformed.set(false);
      }

      if (this.zIndex() != undefined) {
        this.setZIndex(this._initialZIndex);
      }
    }

    this._lastScrollPosition = scrollPosition;

    if (this._transitionDisabled) {
      this._elementRef.nativeElement.style['transition'] =
        this._transitionStyle;
      this._transitionDisabled = false;
    }
  }

  private setTransformY(value: string) {
    this._elementRef.nativeElement.style['transform'] = `translateY(${value})`;
  }

  private setZIndex(value?: number) {
    this._elementRef.nativeElement.style['zIndex'] = value;
  }
}
