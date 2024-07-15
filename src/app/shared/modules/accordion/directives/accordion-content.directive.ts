import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'app-accordion-content, [appAccordionContent]',
  standalone: true,
})
export class AccordionContentDirective {
  constructor(private readonly el: ElementRef) {
    this.el.nativeElement.style.fontSize = '1.3rem';
  }
}
