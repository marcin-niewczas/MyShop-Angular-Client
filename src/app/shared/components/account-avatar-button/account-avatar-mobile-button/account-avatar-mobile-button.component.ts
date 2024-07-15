import { Component, inject, model } from '@angular/core';
import { AvatarComponent } from '../../avatar/avatar.component';
import { AuthService } from '../../../../website/authenticate/auth.service';

@Component({
  selector: 'app-account-avatar-mobile-button',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './account-avatar-mobile-button.component.html',
})
export class AccountAvatarMobileButtonComponent {
  private readonly _authService = inject(AuthService);

  readonly opened = model.required<boolean>();
  readonly user = this._authService.currentUser;
}
