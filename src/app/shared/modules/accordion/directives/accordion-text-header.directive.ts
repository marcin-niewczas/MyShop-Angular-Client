import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'app-accordion-text-header, [appAccordionTextHeader]',
  standalone: true,
})
export class AccordionTextHeaderDirective {
  constructor(private readonly el: ElementRef) {
    this.el.nativeElement.style.fontSize = '1.6rem';
    this.el.nativeElement.style.fontWeight = '500';
    this.el.nativeElement.style.textTransform = 'uppercase';
  }
}
