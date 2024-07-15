import { Component } from '@angular/core';

@Component({
  selector: 'app-shadow-overlay',
  standalone: true,
  imports: [],
  template: '<div class="shadow-overlay"></div>',
  styles: [
    ':host { position: fixed; z-index: 999; top: 0; bottom: 0; right: 0; left: 0; }',
    '.shadow-overlay { height: 100%; background-color: rgba(0, 0, 0, 0.32); backdrop-filter: blur(2px);}',
  ],
})
export class ShadowOverlayComponent {}
