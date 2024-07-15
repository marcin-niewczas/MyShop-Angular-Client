import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  input,
  output,
} from '@angular/core';
import { toBoolean } from '../functions/transform-functions';

@Directive({
  selector: '[checkMaxHeight]',
  standalone: true,
})
export class CheckMaxHeightDirective implements OnChanges {
  @Input({ required: true }) blockEmit!: boolean;

  readonly isWindowScroll = input(false, { transform: toBoolean });
  readonly loadMoreItems = output<void>();

  @HostListener('window:resize')
  onResize(): void {
    const htmlElement = this.isWindowScroll()
      ? document.body
      : (this.element.nativeElement as HTMLElement);

    if (this.isWindowScroll()) {
      if (!this.blockEmit && window.innerHeight >= htmlElement.scrollHeight) {
        this.blockEmit = true;
        this.loadMoreItems.emit();
      }

      return;
    }

    if (
      !this.blockEmit &&
      htmlElement.clientHeight === htmlElement.scrollHeight
    ) {
      this.blockEmit = true;
      this.loadMoreItems.emit();
    }
  }

  constructor(private element: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      const htmlElement = this.isWindowScroll()
        ? document.body
        : (this.element.nativeElement as HTMLElement);

      if (this.isWindowScroll()) {
        if (!this.blockEmit && window.innerHeight >= htmlElement.scrollHeight) {
          this.loadMoreItems.emit();
        }

        return;
      }

      if (
        !this.blockEmit &&
        htmlElement.clientHeight === htmlElement.scrollHeight
      ) {
        this.loadMoreItems.emit();
      }
    }, 0);
  }
}
