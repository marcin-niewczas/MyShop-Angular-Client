import { Component, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { toBoolean } from '../../../../functions/transform-functions';

@Component({
  selector: 'app-accordion-button',
  standalone: true,
  imports: [MatIconModule, MatDividerModule],
  templateUrl: './accordion-button.component.html',
  styleUrl: '../accordion.component.scss',
})
export class AccordionButtonComponent {
  readonly isLast = input(false, { transform: toBoolean });
}
