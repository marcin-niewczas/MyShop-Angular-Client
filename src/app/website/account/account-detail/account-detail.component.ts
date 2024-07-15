import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AccountUserInfoUpdateComponent } from './account-user-info-update/account-user-info-update.component';
import { AuthService } from '../../authenticate/auth.service';
import { AccountEditProfilePhotoDialogComponent } from './account-edit-profile-photo-dialog/account-edit-profile-photo-dialog.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    AvatarComponent,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    NgTemplateOutlet,
    AccountUserInfoUpdateComponent,
    AccountEditProfilePhotoDialogComponent,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss',
})
export class AccountDetailComponent {
  private readonly _authService = inject(AuthService);
  readonly user = this._authService.currentUser;

  readonly editPhotoProfileDialogOpened = signal(false);
}
