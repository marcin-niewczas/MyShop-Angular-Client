import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ec-auth-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `<a
    color="primary"
    mat-icon-button
    [routerLink]="['/authenticate']"
  >
    <mat-icon>person</mat-icon>
  </a>`,
})
export class EcAuthButtonComponent {}
