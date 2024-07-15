import { Component, input, model } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { toBoolean } from '../../../../functions/transform-functions';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { rotateIconAnimation } from '../../../../components/animations';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [MatIconModule, MatDivider],
  templateUrl: './accordion.component.html',
  styleUrl: '../accordion.component.scss',
  animations: [
    rotateIconAnimation,
    trigger('expand', [
      state('void', style({ height: '0', overflow: 'hidden' })),
      transition(':enter', [animate('200ms ease-in-out', style({ height: '*' }))]),
      transition(':leave', [animate('200ms ease-in-out', style({ height: '0' }))]),
    ]),
  ],
})
export class AccordionComponent {
  readonly opened = model(false);
  readonly isLast = input(false, { transform: toBoolean });
}