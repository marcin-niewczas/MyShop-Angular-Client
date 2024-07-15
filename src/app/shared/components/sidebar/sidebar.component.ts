import {
  Component,
  HostListener,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  input,
  model,
} from '@angular/core';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { ShadowOverlayComponent } from '../shadow-overlay/shadow-overlay.component';
import { toBoolean } from '../../functions/transform-functions';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'center';

export const sidebarAnimationDuration = 300;

const animSidebarTiming = `${sidebarAnimationDuration}ms ease-in-out`;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgTemplateOutlet, NgStyle, ShadowOverlayComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('sidebarTrigger', [
      transition('left => void', [
        animate(animSidebarTiming, style({ transform: 'translateX(-100%)' })),
      ]),
      transition('void => left', [
        style({ transform: 'translateX(-100%)' }),
        animate(animSidebarTiming, style({ transform: 'translateX(0)' })),
      ]),
      transition('right => void', [
        animate(animSidebarTiming, style({ transform: 'translateX(100%)' })),
      ]),
      transition('void => right', [
        style({ transform: 'translateX(100%)' }),
        animate(animSidebarTiming, style({ transform: 'translateX(0)' })),
      ]),
      transition('top => void', [
        animate(animSidebarTiming, style({ transform: 'translateY(-100%)' })),
      ]),
      transition('void => top', [
        style({ transform: 'translateY(-100%)' }),
        animate(animSidebarTiming, style({ transform: 'translateY(0)' })),
      ]),
      transition('bottom => void', [
        animate(animSidebarTiming, style({ transform: 'translateY(100%)' })),
      ]),
      transition('void => bottom', [
        style({ transform: 'translateY(100%)' }),
        animate(animSidebarTiming, style({ transform: 'translateY(0)' })),
      ]),
      transition('center => void', [
        animate(animSidebarTiming, style({ opacity: 0 })),
      ]),
      transition('void => center', [
        style({ opacity: 0 }),
        animate(animSidebarTiming, style({ opacity: 1 })),
      ]),
    ]),
    trigger('inOutTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(`${sidebarAnimationDuration}ms ease-in`, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(`${sidebarAnimationDuration}ms ease-in`, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnChanges, OnDestroy {
  readonly opened = model.required<boolean>();
  readonly side = input<Side>('left');
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly minWidth = input<string | undefined>(undefined);
  readonly minHeight = input<string | undefined>(undefined);
  readonly maxWidth = input<string | undefined>(undefined);
  readonly maxHeight = input<string | undefined>(undefined);
  readonly closeSwipeForBottomSidebar = input(false, { transform: toBoolean });
  readonly blockScroll = input(false, { transform: toBoolean });
  readonly backdrop = input(true, { transform: toBoolean });
  readonly disableAnimation = input(false, { transform: toBoolean });
  readonly borderCornerRadius = input(false, { transform: toBoolean });
  readonly borderCornerRadiusValue = input<string>('15px');
  readonly withoutPrestyle = input(false, { transform: toBoolean });
  readonly blockClose = input(false, { transform: toBoolean });

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    this.closeSidebar();
  }

  enableScroll() {
    document.body.style.overflowY = 'auto';
  }

  disableScroll() {
    document.body.style.overflowY = `hidden`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.blockScroll() && this.opened()) {
      this.disableScroll();

      return;
    }

    const tempBlockScroll = changes['blockScroll'];

    if (
      tempBlockScroll &&
      this.opened() &&
      tempBlockScroll.previousValue === true &&
      tempBlockScroll.currentValue === false
    ) {
      this.enableScroll();
      return;
    }

    if (
      tempBlockScroll &&
      this.opened() &&
      tempBlockScroll.previousValue === false &&
      tempBlockScroll.currentValue === true
    ) {
      this.disableScroll();
      return;
    }

    const tempOpened = changes['opened'];

    if (
      tempOpened &&
      tempOpened.previousValue === true &&
      tempOpened.currentValue === false
    ) {
      this.enableScroll();
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.opened() && this.blockScroll()) {
      this.enableScroll();
    }
  }

  closeSidebar() {
    if (!this.blockClose()) {
      this.opened.set(false);

      document.body.style.overflow = 'auto';
    }
  }

  protected getBorderCornerRadiusStyle() {
    switch (this.side()) {
      case 'top':
        return {
          borderBottomLeftRadius: this.borderCornerRadiusValue(),
          borderBottomRightRadius: this.borderCornerRadiusValue(),
        };
      case 'bottom':
        return {
          borderTopLeftRadius: this.borderCornerRadiusValue(),
          borderTopRightRadius: this.borderCornerRadiusValue(),
        };
      case 'right':
        return {
          borderTopLeftRadius: this.borderCornerRadiusValue(),
          borderBottomLeftRadius: this.borderCornerRadiusValue(),
        };
      case 'left':
        return {
          borderTopRightRadius: this.borderCornerRadiusValue(),
          borderBottomRightRadius: this.borderCornerRadiusValue(),
        };
      case 'center':
        return {
          borderRadius: this.borderCornerRadiusValue(),
        };
    }
  }
}
