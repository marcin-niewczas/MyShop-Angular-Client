import { Component } from '@angular/core';
import { LoadingComponent } from '../../../loading/loading.component';
import { inOutAnimation } from '../../../animations';
import { ShadowOverlayComponent } from '../../../shadow-overlay/shadow-overlay.component';

@Component({
  selector: 'app-logout-process-placeholder',
  standalone: true,
  imports: [LoadingComponent, ShadowOverlayComponent],
  templateUrl: './logout-process-placeholder.component.html',
  styleUrl: './logout-process-placeholder.component.scss',
  animations: [inOutAnimation],
  host: { '[@inOutTrigger]': 'in' },
})
export class LogoutProcessPlaceholderComponent {}
