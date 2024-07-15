import { NgModule } from '@angular/core';
import { AccordionButtonComponent } from './components/accordion-button/accordion-button.component';
import { AccordionComponent } from './components/accordion/accordion.component';
import { AccordionTextHeaderDirective } from './directives/accordion-text-header.directive';
import { AccordionContentDirective } from './directives/accordion-content.directive';

@NgModule({
  declarations: [],
  imports: [
    AccordionButtonComponent,
    AccordionComponent,
    AccordionTextHeaderDirective,
    AccordionContentDirective,
  ],
  exports: [
    AccordionButtonComponent,
    AccordionComponent,
    AccordionTextHeaderDirective,
    AccordionContentDirective,
  ],
})
export class AccordionModule {}
