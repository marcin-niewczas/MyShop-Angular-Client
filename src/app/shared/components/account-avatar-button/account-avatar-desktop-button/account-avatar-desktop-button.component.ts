import {
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { inOutAnimation } from '../../animations';
import { UserMenuNavListComponent } from '../user-menu-nav-list/user-menu-nav-list.component';
import { AuthService } from '../../../../website/authenticate/auth.service';
import { AppRouteSection } from '../../../models/others/app-route-section.enum';

@Component({
  selector: 'app-account-avatar-desktop-button',
  standalone: true,
  imports: [
    AvatarComponent,
    MatDividerModule,
    MatIconModule,
    RouterLink,
    UserMenuNavListComponent,
  ],
  templateUrl: './account-avatar-desktop-button.component.html',
  styleUrl: './account-avatar-desktop-button.component.scss',
  animations: [inOutAnimation],
})
export class AccountAvatarDesktopButtonComponent {
  private readonly _authService = inject(AuthService);

  readonly opened = model.required<boolean>();
  readonly user = this._authService.currentUser;
  readonly appRouteSection = input.required<AppRouteSection>();
}
