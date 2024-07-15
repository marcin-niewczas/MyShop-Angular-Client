import { Component, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-pwa-dialog',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, SidebarComponent],
  templateUrl: './pwa-dialog.component.html',
  styleUrl: './pwa-dialog.component.scss',
})
export class PWADialogComponent {
  readonly opened = model.required<boolean>();

  reloadPage() {
    location.reload();
  }
}
