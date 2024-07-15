import { AfterViewInit, Directive, ElementRef, input } from '@angular/core';

@Directive({
  selector: '[focusElement]',
  standalone: true,
})
export class FocusElementDirective implements AfterViewInit {
  readonly focusDelay = input(0);

  constructor(private readonly _elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => this._elementRef.nativeElement.focus(), this.focusDelay());
  }
}
